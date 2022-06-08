import json

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from AlignmentGraph import AlignmentGraph
import uvicorn
import pandas as pd
import numpy as np
import os
import csv
import codecs
from io import StringIO

from pydantic_models.nli_data_point import NLIDataResponse, NLIDataPoint, NLIDataSubmission, \
    NLISubmissionDisplay, NLIEmbeddingResponse, NLISubmissionDisplayGraph
from typing import Callable
import pickle
import collatex

from transformers import AutoModelForSequenceClassification, AutoTokenizer
from roberta_inference  import roberta_inference, roberta_probability

app = FastAPI(
    title="Interactive Counterfactual Generation",
    description="""This is a dashboard for counterfactual generation tailored for NLI task.""",
    version="0.1.0",
)

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

data = pd.read_csv(f"data/NLI/poly_cfs/train_cf4.csv")

grouped_data = data.groupby(["sentence1", "sentence2"])[["gold_label"]].count()
roberta_tokenizer = AutoTokenizer.from_pretrained('roberta-large-mnli')
roberta_model = AutoModelForSequenceClassification.from_pretrained('roberta-large-mnli',
                                                                   num_labels=3)

DEBUG = False

if not DEBUG:  # Slow imports
    from easy_polyjuice import DynamicPolyjuice
    poly = DynamicPolyjuice()
    poly.suggest_single_sentence("start.", "end.", ["lexical"], 0, 0)


@app.get("/data-count")
def get_data_length() -> int:
    max_count = len(grouped_data)
    return max_count


@app.get("/roberta-label")
def get_roberta_label(sentence1: str, sentence2: str) -> str:
    return roberta_inference(sentence1, sentence2, roberta_tokenizer, roberta_model)


@app.get("/ask-poly")
def get_data_length(sentence1: str, sentence2: str, code: str, start_idx: str,
                    end_idx: str) -> int:
    q_codes = [code]
    return poly.suggest_single_sentence(sentence1, sentence2, q_codes, int(start_idx),
                                        int(end_idx))


@app.get("/upload-data", response_model=NLIDataResponse)
def upload_data(count: int):
    sentence1 = grouped_data.iloc[count].name[0]
    sentence2 = grouped_data.iloc[count].name[1]
    filtered_data = data[(data["sentence1"] == sentence1) & (data["sentence2"] == sentence2)]
    return filtered_data.to_dict(orient="records")


@app.get("/upload-submitted-data", response_model=NLISubmissionDisplay)
def upload_submitted_data(sentence1: str, sentence2: str):
    data = pd.read_csv(f"data/NLI/submitted/cfs_example_submitted.tsv", sep="\t")
    matching_data = data[(data['sentence1'] == sentence1) & (data['sentence2'] == sentence2)]

    # compute robot label
    labels = ["Entailment", "Neutral", "Contradiction"]
    robot_labels = list()
    for index, row in matching_data.iterrows():
        probs = [row["Entailment"], row["Neutral"],row["Contradiction"]]
        label_index = probs.index(max(probs))
        label = labels[label_index]
        robot_labels.append(label)

    matching_data["Robot_Label"] = robot_labels
    # renaming here for the table in the frontend
    matching_data = matching_data.rename(columns={"suggestionRH": "New Hypothesis", "Robot_Label": "Robot Label", "suggestionRH_label": "Human Label"})

    return matching_data[["New Hypothesis", "Robot Label", "Human Label"]].to_dict(orient="records")


@app.get("/upload-submitted-graph", response_model=NLISubmissionDisplayGraph)
def upload_submitted_graph(sentence1: str, sentence2: str, labels: str):
    collation = collatex.core_classes.Collation()
    data = pd.read_csv(f"data/NLI/submitted/cfs_example_submitted.tsv", sep="\t")
    # filter for lines with sentence1, sentence2 matching: added label checking here
    matching_data = data[(data['sentence1'] == sentence1) & (data['sentence2'] == sentence2)]
    # get gold label at this point:
    if not matching_data.empty:
        gold_label = matching_data['gold_label'].iloc[0]
    else:
        gold_label = ""

    matching_data = matching_data[matching_data['suggestionRH_label'].apply(lambda a: a in labels)]
    print(f'matching data : '
          f'{matching_data}')

    print(f'labels: '
          f'{labels}')
    # add original as id = 0 only add original if label fits
    collation_empty = True
    if gold_label in labels:
        collation.add_plain_witness(str(0), sentence2)
        collation_empty = False
    # add all matching counterfactuals
    if not matching_data.empty:
        for i, line in enumerate(matching_data['suggestionRH']):
            collation.add_plain_witness(str(i + 1), line)
            collation_empty = False

    if labels == "":
        collation.add_plain_witness(str(0), "Please select a label!")
        collation_empty = False
    elif collation_empty:
        collation.add_plain_witness(str(0), "Nothing here yet!")

    # collate to find matching parts

    alignment_table = collatex.core_functions.collate(collation, near_match=True,
                                                      segmentation=False, output="table")

    # return a tangled tree:
    # e.g. ordered list of lists one list is a column from the collation table
    graph = AlignmentGraph(alignment_table, len(collation.witnesses))

    # return probabilities for each sentence as a nested dictionary
    #list of probs is ["entailment, neutral, contradiction"]
    # also return pseudo probabilities of human annotator e.g. 1,0,0
    probabilities = list()
    if not matching_data.empty:
        for index,row in matching_data.iterrows():
            dic = dict()
            dic["id"] = row["suggestionRH"]
            dic["probs"] = [row["Entailment"],row["Neutral"],row["Contradiction"]]
            label = row["suggestionRH_label"]
            if label == "Entailment":
                dic["human_probs"] = [1.0, 0.0, 0.0]
            elif label == "Neutral":
                dic["human_probs"] = [0.0, 1.0, 0.0]
            elif label == "Contradiction":
                dic["human_probs"] = [0.0, 0.0, 1.0]

            probabilities.append(dic)

    print(f'probabilities: '
          f'{probabilities}')


    return [graph.levels_string, graph.occurrences, probabilities]


@app.get("/upload-embeddings-plot")
def upload_embeddings():
    # for now just read in the file and create a scatterplot
    records = np.load("data/hidden_states.npz", allow_pickle=True)["records"]
    records_df = pd.DataFrame.from_records(records)
    # read in umap embeddings
    infile = open("data/umap_mapper.pkl", "rb")
    umap = pickle.load(infile)
    embeddings = umap.embedding_
    embeddings_df = pd.DataFrame(embeddings, columns=["X1", "X2"])
    # join the two dataframes
    response = records_df.join(embeddings_df, on=None).reset_index(drop=True).drop(
        columns=['i'])
    return response.to_dict(orient="records")

@app.post("/submit-data")
async def submit_data(data_row: NLIDataSubmission):
    """
    Function receives a new submitted counterfactual and updates it in the submitted tsv file to store.
    """
    print(data_row)
    prob_dict = roberta_probability(data_row["sentence1"], data_row["suggestionRH"], roberta_tokenizer, roberta_model)
    print(prob_dict)
    # read in the current tsv as well to remove if duplicated
    old_data = pd.read_csv(f"data/NLI/submitted/cfs_example_submitted.tsv", sep="\t")

    new_data = pd.DataFrame.from_dict([data_row])

    new_data['Neutral'] = [prob_dict['NEUTRAL']]
    new_data['Entailment'] = [prob_dict['ENTAILMENT']]
    new_data['Contradiction'] = [prob_dict['CONTRADICTION']]

    print(new_data)
    # we handle the duplicates here:
    data = pd.concat([old_data, new_data], ignore_index=True).replace('', np.nan, regex=True,
                                                                      inplace=False)
    data.drop_duplicates(["sentence1", "sentence2", "suggestionRH", "suggestionRH_label"],inplace=True, ignore_index=True)

    data.to_csv(f"data/NLI/submitted/cfs_example_submitted.tsv", index=False, header=True,
                sep="\t")
    return True


@app.post("/delete-data")
async def delete_data(sentence1: str, sentence2: str, counterfactual: str):
    old_data = pd.read_csv(f"data/NLI/submitted/cfs_example_submitted.tsv", sep="\t")
    # find line(s) to delete and write new df
    new_data = old_data.drop(old_data[(old_data["sentence1"] == sentence1) & (old_data["sentence2"] == sentence2) & (old_data["suggestionRH"] == counterfactual)].index)
    new_data.to_csv(f"data/NLI/submitted/cfs_example_submitted.tsv", index=False, header=True,
                sep="\t")
    return True


@app.post("/files/")
async def create_file(file: bytes = File(...)):
    return {"file_size": len(file)}


@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    return {"filename": file.filename}


@app.get("/", response_class=HTMLResponse)
async def root():
    html_content = """
        <html>
            <head>
                <title>Week 2</title>
            </head>
            <body>
                <h1>Test Python Backend</h1>
                Visit the <a href="/docs">API doc</a> (<a href="/redoc">alternative</a>) for usage information.
            </body>
        </html>
        """
    return HTMLResponse(content=html_content, status_code=200)


def update_schema_name(app: FastAPI, function: Callable, name: str) -> None:
    """
    Updates the Pydantic schema name for a FastAPI function that takes
    in a fastapi.UploadFile = File(...) or bytes = File(...).

    This is a known issue that was reported on FastAPI#1442 in which
    the schema for file upload routes were auto-generated with no
    customization options. This renames the auto-generated schema to
    something more useful and clear.

    Args:
        app: The FastAPI application to modify.
        function: The function object to modify.
        name: The new name of the schema.
    """
    for route in app.routes:
        if route.endpoint is function:
            route.body_field.type_.__name__ = name
            break


update_schema_name(app, create_file, "CreateFileSchema")
update_schema_name(app, create_upload_file, "CreateUploadSchema")
