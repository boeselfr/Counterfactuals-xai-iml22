import collections
import csv
import pathlib
from typing import Any, Dict, List, NamedTuple, Optional, Sequence, Tuple
import numpy as np

import datasets
import transformers

MODEL_INPUT_KEYS = ['input_ids', 'attention_mask']  # Use these keys for model inference.

ALL_COMBINED_DIR = pathlib.Path('../backend/data/NLI/all_combined/')
DEV_PATH = ALL_COMBINED_DIR / "dev.tsv"
TRAIN_PATH = ALL_COMBINED_DIR / "train.tsv"
TEST_PATH = ALL_COMBINED_DIR / "test.tsv"

assert TRAIN_PATH.exists()


def read_tsv_as_records(tsv_path=TRAIN_PATH) -> List[Dict[str, str]]:
    with open(tsv_path) as f:
        reader = csv.DictReader(f, delimiter="\t")
        rows = list(reader)
    return rows


def oversample(dataset: datasets.Dataset) -> datasets.Dataset:
    from torch.utils.data import Subset,ChainDataset,ConcatDataset
    labels = np.array([d["label"].item() for d in dataset])
    arrays_lab = [np.array([labels==i],dtype=bool)  for i in range(len(set(labels)))]
    max = np.max(np.sum(arrays_lab,-1))
    print(max)
    diff = (max - np.sum(arrays_lab,-1)).flatten()
    print(diff)
    lis = [Subset(dataset,range(len(dataset)))]
    for i in range(len(set(labels))): 
        if np.sum(arrays_lab[i]) == 0:
            continue
        additional = Subset(dataset,np.argwhere(arrays_lab[i]==True)[:,1].flatten().tolist())
        print(np.argwhere(arrays_lab[i]==True)[:,1].flatten().tolist())
        a = int(diff[i]/np.sum(arrays_lab[i]))
        b = diff[i] % np.sum(arrays_lab[i])
        residual = Subset(dataset,np.argwhere(arrays_lab[i]==True)[:,1].flatten().tolist()[:b])
        print(np.argwhere(arrays_lab[i]==True)[:,1].flatten().tolist()[:b])
        lis += [additional]*a + [residual]
    dataset = ConcatDataset(lis)
    return dataset

ANSWER_LABEL_ORDER: List[str] = ["contradiction", "neutral", "entailment"]


def to_dataset(tsv_path=TRAIN_PATH, tokenizer=None) -> datasets.Dataset:
    records = read_tsv_as_records(tsv_path)
    data_dicts = collections.defaultdict(list)

    # Build answer_list_label_order, where the ith entry is the answer with label==i.
    # TODO(shwang): Align this with the label ordering in whatever model we are loading.
    # Yes, this should match https://huggingface.co/roberta-large-mnli.
    # Roberta-large-mnli has 355M params.

    for d in records:
        for k, v in d.items():
            data_dicts[k].append(v)

    assert sorted(data_dicts.keys()) == ["gold_label", "sentence1", "sentence2"]

    # TODO(shwang): Insert supplementary data, which relies on a weird matching against the contract_name of
    #   a particular row, maybe to get the answer.

    # Dataset.from_dict accepts
    # {'id': [0, 1, 2], 'name': ['mary', 'bob', 'eve']}
    ds = datasets.Dataset.from_dict(data_dicts)

    ds = ds.map(
        lambda example: {'label': ANSWER_LABEL_ORDER.index(example['gold_label'])}
    )

    fast = False
    if fast:
        ds = ds.select(range(1000))

    if tokenizer is None:
        tokenizer = transformers.AutoTokenizer.from_pretrained('roberta-large-mnli')
    encoded_ds = ds.map(
        lambda examples: tokenizer(
            examples['sentence1'], examples['sentence2'],
            padding='max_length',
            truncation=True,
        ),
        desc="tokenizing",
        batched=True,
        num_proc=4,
    )

    # Check that tokenizing looks sane.
    # x = encoded_ds[0]['input_ids']
    # s = tokenizer.decode(x)
    # breakpoint()
    # print(s)

    encoded_ds.set_format(
        type='torch',
        columns=[*MODEL_INPUT_KEYS, "label"],
    )
    print(encoded_ds)
    print(f"Answer list (in label order): {ANSWER_LABEL_ORDER}")
    print("label counts: ", count_labels(encoded_ds, ANSWER_LABEL_ORDER))
    return encoded_ds


def count_labels(ds, labels: Optional[Sequence[str]] = None) -> List[Tuple[Any, int]]:
    counter = collections.Counter()
    for x in ds:
        counter[x["label"].item()] += 1

    result = []
    for k in sorted(counter.keys()):
        val = counter[k]
        if labels is not None:
            k = labels[k]
        assert k not in result
        result.append((k, val))
    return result


if __name__ == "__main__":
    to_dataset()
