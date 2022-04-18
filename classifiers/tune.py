import argparse
import pathlib
from itertools import product
import pickle
from typing import Optional

from kornia.losses import focal
import sklearn.metrics
import torch
from torch.utils.data import DataLoader
from torch.nn import functional as F
from datasets.utils import disable_progress_bar
import numpy as np
import transformers

import data, utils

# Disable progress bar for tokenizing?
# disable_progress_bar()


def R(unrounded_list, digits=3) -> list:
    return [round(x, digits) for x in unrounded_list]


def log(text: str = "", newline="\n", stdout=True, file_write=True):
    with open("runs.txt", "a") as f:
        f.write(text + newline)
    if stdout:
        print(text)


def main(args: argparse.Namespace) -> None:
    if not args.dry_run:
        n_epochs = args.nepochs
        n_runs = args.nruns
        eval_interval = args.eval_interval
    else:
        print("**DRY RUN**")
        n_epochs = 1
        n_runs = 1
        eval_interval = 1

    log()
    if args.dry_run:
        log("**DRY RUN**\n")

    tokenizer = transformers.AutoTokenizer.from_pretrained(args.model)

    for run in range(1, n_runs + 1):
        run_dir = args.log_root / f"auto-q{args.question_num}_{args.model}-run_{run}"
        run_dir.mkdir(exist_ok=True, parents=True)

        # data for normal training + evaluation
        num_labels = 3
        train_ds = data.to_dataset(data.TRAIN_PATH, tokenizer)
        test_ds = data.to_dataset(data.TEST_PATH, tokenizer)
        print(f"{len(train_ds)} examples in train_ds")
        print(f"{len(test_ds)} examples in test_ds")

        log(f"train: {data.count_labels(train_ds, data.ANSWER_LABEL_ORDER)}", file_write=run==1)
        log(f"test: {data.count_labels(test_ds, data.ANSWER_LABEL_ORDER)}", file_write=run==1)

        if args.oversample:
            log(f"OVERSAMPLING...", file_write=run==1)
            train_ds = data.oversample(train_ds)
            print(f"{len(train_ds)} examples in oversampled train_ds")
            log(f"oversampled train: {data.count_labels(train_ds, data.ANSWER_LABEL_ORDER)}", file_write=run==1)

        if args.focal_gamma is not None:
            log(f"FOCAL LOSS: gamma={args.focal_gamma}")

        if args.oversample is None and args.focal_gamma is None:
            log(f"NO ALGORITHMIC DATA IMBALANCE CORRECTIONS.", file_write=run==1)

        train_dataloader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True)
        test_dataloader = DataLoader(test_ds, batch_size=args.batch_size, shuffle=False)

        model, optimizer = utils.load_model(args, num_labels=num_labels)
        best_test_accuracy = -1

        log(f"RUN {run} OUT OF {n_runs}")

        assert n_epochs >= 1
        for epoch in range(1, n_epochs + 1):
            print()
            train(model, optimizer, train_dataloader, epoch, num_labels, focal_loss_gamma=args.focal_gamma)
            print(f"Epoch {epoch}")
            if epoch % eval_interval == 0:
                train_acc, _, _, train_f1_all, *_ = evaluate(model, train_dataloader, name="train")
                test_acc, f1_micro, f1_macro, test_f1_all, precisions, recalls, logits, labels = evaluate(
                    model, test_dataloader, name="test")
                best_test_accuracy = max(test_acc, best_test_accuracy)


def train(
        model,
        optimizer,
        train_dataloader,
        epoch,
        num_classes: int,
        focal_loss_gamma: Optional[float] = None,
        log_interval=10,
) -> None:
    model.train()
    if focal_loss_gamma is None:
        criterion = torch.nn.BCEWithLogitsLoss()
        convert_one_hot = True
    else:
        criterion = focal.FocalLoss(alpha=0.5, gamma=focal_loss_gamma, reduction="mean")
        convert_one_hot = False

    # Loop over each batch from the training set
    for step, batch in enumerate(train_dataloader):
        model_inputs = {k: v.cuda() for k, v in batch.items()
                        if k in data.MODEL_INPUT_KEYS}
        labels = batch["label"].cuda()

        if convert_one_hot:
            target = F.one_hot(labels, num_classes=num_classes).cuda().float()
        else:
            target = labels

        # Zero gradient buffers
        optimizer.zero_grad()

        # Forward pass
        output = model(**model_inputs)[0].squeeze()
        loss = criterion(output, target)

        # Backward pass
        loss.backward()

        # Update weights
        optimizer.step()

        if step % log_interval == 0 and step > 0:
            print('Train Epoch: {} [{}/{} ({:.0f}%)]\tLoss: {:.6f}'.format(
                epoch, step * len(batch["label"]),
                len(train_dataloader.dataset),
                       100. * step / len(train_dataloader), loss))


def main_eval(model="roberta-large-mnli") -> None:
    # model1 = transformers.AutoModel.from_pretrained(model)
    model = transformers.AutoModelForSequenceClassification.from_pretrained(model, num_labels=3)
    model.cuda()
    tokenizer = transformers.AutoTokenizer.from_pretrained('roberta-large-mnli')
    ds = data.to_dataset(data.TEST_PATH, tokenizer=tokenizer)
    data_loader = DataLoader(ds, batch_size=64, shuffle=True)
    evaluate(model, data_loader, name="main_eval")


def evaluate(model, test_hard_dataloader, name=None):
    model.eval()
    all_predictions = []
    all_labels = []
    all_logits = []

    for batch in test_hard_dataloader:
        model_inputs = {k: v.cuda() for k, v in batch.items()
                        if k in data.MODEL_INPUT_KEYS}

        with torch.no_grad():
            logits = model(**model_inputs)[0]

        predictions_b: np.ndarray = torch.argmax(logits, dim=1).detach().cpu().numpy()
        # predictions = (output > 0).astype(int)  # sigmoid version

        labels_b: np.ndarray = batch["label"].detach().cpu().numpy()
        all_predictions.append(predictions_b)
        all_labels.append(labels_b)
        all_logits.append(logits.detach().cpu().numpy())

    all_labels = np.concatenate(all_labels)
    all_predictions = np.concatenate(all_predictions)
    all_logits = np.concatenate(all_logits)
    acc = np.mean(all_labels == all_predictions)
    f1_micro = sklearn.metrics.f1_score(all_labels, all_predictions, average='micro')
    f1_macro = sklearn.metrics.f1_score(all_labels, all_predictions, average='macro')
    f1_all = sklearn.metrics.f1_score(all_labels, all_predictions, average=None)
    precision = sklearn.metrics.precision_score(all_labels, all_predictions, average=None)
    recall = sklearn.metrics.recall_score(all_labels, all_predictions, average=None)

    if name is not None:
        print(f"[{name}] ", end='')
    print(f'Accuracy: {acc:.4f}  F1: {R(f1_all, 4)}  F1_macro: {f1_macro:.4f}')
    return acc, f1_micro, f1_macro, f1_all, precision, recall, all_logits, all_labels


def console_main():
    parser = argparse.ArgumentParser()
    # parser.add_argument("--model", "-m", type=str, default="bert-base-uncased")
    parser.add_argument("--model", "-m", type=str, default="roberta-large-mnli")
    parser.add_argument("--question_num", "-q", type=int, default=0)
    parser.add_argument("--log_root", type=pathlib.Path, default="runs/default")
    parser.add_argument("--valid_prop", "-p", type=float, default=0.2)
    parser.add_argument("--nruns", "-r", type=int, default=1)

    parser.add_argument("--ngpus", "-n", type=int, default=1)
    parser.add_argument("--nepochs", "-e", type=int, default=6)
    parser.add_argument("--eval_interval", "-i", type=int, default=1)
    parser.add_argument("--dry_run", "-d", action="store_true")

    parser.add_argument("--batch_size", "-b", type=int, default=8)
    parser.add_argument("--max_length", "-t", type=int, default=64)
    parser.add_argument("--weight_decay", "-w", type=float, default=0.01)
    parser.add_argument("--learning_rate", "-l", type=float, default=2e-5)
    parser.add_argument("--verbose", "-v", action="store_true")
    parser.add_argument("--grid_search", "-g", action="store_true")
    parser.add_argument("--save", "-s", action="store_true")
    parser.add_argument("--oversample", "-o", action="store_true")
    parser.add_argument("--focal_gamma", "-f", type=float, default=None)
    args = parser.parse_args()

    if args.grid_search:
        file = "grid_search_results.txt"
        args.nruns = 1
        models = ["bert-base-uncased", "bert-large-uncased", "roberta-large", "albert-xxlarge-v2"]
        lrs = [1e-5, 3e-5]
        batch_sizes = [8, 16]
        epochs = [2,4]

        with open(file, "a") as f:
            f.write("{}\n".format(args))
            f.write("models: {}, lrs: {}, batch_sizes: {}, epochs: {}\n".format(models, lrs, batch_sizes, epochs))

        for model, lr, bs, nepoch in product(models, lrs, batch_sizes, epochs):
            args.model = model
            args.learning_rate = lr
            args.batch_size = bs
            args.nepochs = nepoch

            main(args)
            # with open(file, "a") as f:
            #     f.write("model: {}, lr: {}, batch_size: {}, nepoch: {}.\n test hard accuracy: {:.3f}, test accuracy: {:.3f}, test hard em: {:.3f}, test em: {:.3f}\n".format(model, lr, bs, nepoch, test_hard_acc, test_acc, test_hard_em, test_em))
    else:
        main(args)


if __name__ == "__main__":
    # main_eval()
    console_main()
