from typing import List, Tuple

import torch.cuda
from matplotlib import pyplot as plt
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import torch as th
import transformers
import umap.plot


def load_nli() -> List[dict]:
    """Load the NLI dataset as a list of dictionary records."""
    path = "backend/data/NLI/original/train.tsv"
    data = pd.read_csv(path, sep="\t")
    # print(data)
    records = data.to_dict(orient="records")
    print(records[0].keys())
    # print(records[-1])

    records = [dict(**orig, i=i) for i, orig in enumerate(records)]
    return records


def make_hidden_states_from_records(model_name="roberta-large-mnli", records=None) -> Tuple[np.ndarray, List[dict]]:
    """Load the huggingface transformers model with name `model_name` and calculate the
    final pooled activations of every (premise, hypothesis) pair for that model.
    """
    records = records or load_nli()
    model = transformers.AutoModel.from_pretrained(model_name).cuda()
    tokenizer = transformers.AutoTokenizer.from_pretrained(model_name)

    def get_last_hidden_state(inputs):
        enc_input = tokenizer(inputs, return_tensors="pt", padding=True, truncation=True)
        if torch.cuda.is_available():
            enc_input = {k: v.cuda() for k, v in enc_input.items()}

        model.eval()
        with th.no_grad():
            output = model(**enc_input)
        return output.pooler_output.cpu().detach().numpy()

    batch_size = 4
    outputs = []
    for start_idx in range(0, len(records), batch_size):
        i, j = start_idx, start_idx + batch_size
        inputs = [(record["sentence1"], record["sentence2"]) for record in records[i:j]]
        output = get_last_hidden_state(inputs)
        outputs.append(output)

    result = np.concatenate(outputs)
    assert len(result) == len(records)
    return result


def main() -> None:
    """Save a UMAP plot of the activations of the entire training dataset, color-coded by the gold_label."""
    records = load_nli()
    hidden_states = make_hidden_states_from_records(records=records)
    hidden_states = StandardScaler().fit_transform(hidden_states)

    reducer = umap.UMAP()
    mapper = reducer.fit(hidden_states)

    labels = np.array([record["gold_label"] for record in records])
    umap.plot.points(mapper, labels=labels, theme='fire')
    plt.title("Static UMAP embeddings: roberta-large-mnli activations")
    plt.savefig("umap_all.png")
    print("Saved static UMAP image to umap_all.png.")


if __name__ == "__main__":
    main()
