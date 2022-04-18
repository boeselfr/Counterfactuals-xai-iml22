import csv
import datetime
import pathlib
from typing import List
import warnings

import numpy as np
import randomname
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoConfig, AdamW


def load_model(args, num_labels: int, load_path=None, cache_dir=None):
    if cache_dir is not None:
        config = AutoConfig.from_pretrained(args.model, num_labels=num_labels, cache_dir=cache_dir)
    else:
        config = AutoConfig.from_pretrained(args.model, num_labels=num_labels)
    model = AutoModelForSequenceClassification.from_pretrained(args.model, config=config)
    if load_path is not None:
        model.load_state_dict(torch.load(load_path))

    model.cuda()
    model = torch.nn.DataParallel(model, device_ids=[i for i in range(args.ngpus)])

    print('\nPretrained model "{}" loaded'.format(args.model))
    no_decay = ['bias', 'LayerNorm.weight']
    optimizer_grouped_parameters = [
        {'params': [p for n, p in model.named_parameters()
                    if not any(nd in n for nd in no_decay)],
         'weight_decay': args.weight_decay},
        {'params': [p for n, p in model.named_parameters()
                    if any(nd in n for nd in no_decay)],
         'weight_decay': 0.0}
    ]
    optimizer = AdamW(optimizer_grouped_parameters, lr=args.learning_rate, eps=1e-8)

    return model, optimizer
