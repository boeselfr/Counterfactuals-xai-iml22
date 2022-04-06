from typing import List, Tuple

from matplotlib import pyplot as plt
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import torch as th
import transformers
import umap.plot


def main_load_model():
    # TODO(shwang): Maybe find an SNLI based model? MNLI is trained on less data and a maybe a wider variety of
    #    categories than SNLI.
    # But this is good enough for making preliminary visualizations for this course project.


    # TODO(shwang): Maybe use roberta-large projections later "roberta-large-mnli" (no textattack) once I have
    #   more GPU memory available on my computer.
    model_name = "textattack/roberta-base-MNLI"
    tokenizer = transformers.AutoTokenizer.from_pretrained(model_name)
    model = transformers.AutoModel.from_pretrained(model_name)
    inputs = [("I love you.", "I like you very much."), ("I like you.", "I love you.")]
    enc_input = tokenizer(inputs, return_tensors="pt", padding=True, truncation=True)
    print(enc_input)
    output = model(**enc_input)
    print(output.last_hidden_state)


# Quick and dirty Strategy:
# (1) Load model using AutoModel, not AutoModelForSequenceClassification, because the former will give me
#     final_hidden_states output by default without additional arguments that I don't care to figure out.
# (2) Function for loading all of NLI.
# (3) Compute `final_hidden_state` for all of NLI.
# (4) Save records: (row_id, final_hidden_state, label, premise, hypothesis).
# (5) Make a png for each premise that can be loaded statically into the interface.
#     (a) Gather every record WHERE premise==current_premise
#     (b) Use UMAP to make a PNG of all of the final_hidden_states.
#     (c) Save it somewhere, idk.
# (6) ...do front-end loading of this png


def load_nli() -> List[dict]:
    # path = "data/NLI/original/train.tsv"
    path = "/Users/fredericboesel/Documents/master/frühling22/interactive_ml/project/Counterfactuals-xai-iml22/backend/data/NLI/original/test.tsv"
    data = pd.read_csv(path, sep="\t")
    # print(data)
    records = data.to_dict(orient="records")
    print(records[0].keys())
    # print(records[-1])

    records = [dict(**orig, i=i) for i, orig in enumerate(records)]
    return records


def main_make_hidden_states_from_records(model_name="roberta-base-mnli") -> Tuple[np.ndarray, List[dict]]:
    records = load_nli()
    # TODO(shwang): batch size? for start_idx in range(0, len(records), batch_size):
    # inputs = [(record["sentence1"], record["sentence2"]) for record in records]
    # output = get_last_hidden_state(inputs)
    # print(output)

    model = transformers.AutoModel.from_pretrained(model_name)
    tokenizer = transformers.AutoTokenizer.from_pretrained(model_name)
    def get_last_hidden_state(inputs):
        enc_input = tokenizer(inputs, return_tensors="pt", padding=True, truncation=True)
        enc_input = {k: v for k, v in enc_input.items()}

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

    return result, records


def main_umapper_all():
    """Save a UMAP plot of the activations of the entire training dataset, color-coded by the gold_label."""

    # TODO(shwang):
    # 1. Do the UMAP without using data.
    # 2. Do the UMAP with labels?
    # 3. Another time: Project UMAP to a new point and mark it with a star.
    hidden_states, records = main_make_hidden_states_from_records()
    hidden_states = StandardScaler().fit_transform(hidden_states)
    # print(hidden_states)

    reducer = umap.UMAP()
    mapper = reducer.fit(hidden_states)

    labels = np.array([record["gold_label"] for record in records])
    umap.plot.points(mapper, labels=labels, theme='fire')
    plt.title("Static UMAP embeddings: roberta-base-mnli activations")
    # plt.show()
    print(mapper)
    print(np.shape(hidden_states))

    plt.savefig("umap_all_testf.png")




    # Selling this as a Lay-user feature -- we could show the lay user what the classifier predicts
    # their new sentence is.
    #
    # Model output Logits  => bar plot shows the probability of the sentence.
    # Model activations => add a star point to the UMAP plot.



def main_umapper_by_premise():
    """Make some umap plots for every premise.

    Originally I thought it would be a good idea to save umap plots as *.png for every premise
    (as a visualization when the front-end is suggesting CFs for a particular premise).

    However, I realized that there are only one or two examples of every premise.
    So this is pretty useless right now.

    A workable idea that is similar would be to dynamically generate UMAP plots
    for the front-end as the user adds new CFs to the table.

    If my GPU is spinning in the background this should compute very quickly.
    """
    # TODO(shwang):
    # 1. Do the UMAP without using data.
    # 2. Do the UMAP with labels?
    # 3. Another time: Project UMAP to a new point and mark it with a star.

    records = load_nli()
    df = pd.DataFrame.from_records(records)
    premises = list(set(df["sentence1"]))
    breakpoint()

    print(df.loc[df["sentence1"] == premises[0]])
    # TODO(shwang): Save premise list to txt file?
    # Yeah, maybe later when we have
    
    """ There are only two examples currently available for each premise.
    Later, we will be adding lots of CFs to the dataset. When that happens,
    we can produce a plot of all the different CFs?
    
    
    (Pdb) p df["sentence1"].value_counts()
    A fireman standing on top of a firetruck.                          ...    2
    A man in a safety vest and black hat wearing rubber gloves is crouc...    2
    a group of people sitting on the ground on the sidewalk            ...    2
    A child smiling in a park                                          ...    2
    A little girl is licking a dinner plate and getting food all over h...    2
                                                                       ...   ..
    A woman standing in front of water and dry grass smiles.           ...    1
    A biker spins his bike in the air above the ground.                ...    1
    Three men, two with white shirts who appear to be host to a Rodeo H...    1
    Two men in had hats are on ladders working on a house.             ...    1
    A soccer player in white is about to strike the ball in front of a ...    1
    """

    # reducer = umap.UMAP().fit(...?)

    hidden_states, _ = main_make_hidden_states_from_records()
    hidden_states = StandardScaler().fit_transform(hidden_states)
    reducer = umap.UMAP()
    mapper = reducer.fit(hidden_states)
    # Idea: Could cache (reducer, mapper) as pickle for adding dynamic points.

    # TODO: How to plot subset? Maybe use 1subset_points=subset` parameter.
    # Use the GitHub issue Plotting a subset of points in umap.plot.
    # Maybe this requires a DataFrame, which is why I have one as a local variable right now.
    for premise in premises:
        labels = np.array([record["gold_label"] for record in records])
        umap.plot.points(mapper, labels=labels, theme='fire')
        plt.show()
        plt.title(premise[:80])
        plt.savefig(".png")


if __name__ == "__main__":
    main_umapper_all()
