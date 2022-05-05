from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import pandas as pd
import numpy as np
import os
import csv
import codecs
from io import StringIO
from pydantic_models.nli_data_point import NLIDataResponse, NLIDataPoint, NLIDataSubmission, \
    NLISubmissionDisplay, NLIEmbeddingResponse
from typing import Callable
import pickle
from collatex import *

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

data = pd.read_csv(f"data/NLI/poly_cfs/train_cf.csv")
grouped_data = data.groupby(["sentence1", "sentence2"])[["gold_label"]].count()


@app.get("/data-count")
def get_data_length() -> int:
    max_count = len(grouped_data)
    return max_count


@app.get("/upload-data", response_model=NLIDataResponse)
def upload_data(count: int):
    sentence1 = grouped_data.iloc[count].name[0]
    sentence2 = grouped_data.iloc[count].name[1]
    filtered_data = data[(data["sentence1"] == sentence1) & (data["sentence2"] == sentence2)]
    return filtered_data.to_dict(orient="records")


@app.get("/upload-submitted-data", response_model=NLISubmissionDisplay)
def upload_submitted_data(sentence1: str, sentence2: str):
    data = pd.read_csv(f"data/NLI/submitted/cfs_example_submitted.tsv", sep="\t")
    # filter for lines with sentence1, sentence2 matching:
    matching_data = data[(data['sentence1'] == sentence1) & (data['sentence2'] == sentence2)]
    # now reorder the table to show neutral entailment and contradiction
    neutral = pd.Series(
        matching_data.loc[matching_data['suggestionRH_label'] == 'Neutral', 'suggestionRH'],
        name='Neutral').dropna(inplace=False).reset_index(drop=True)
    entailment = pd.Series(matching_data.loc[matching_data[
                                                 'suggestionRH_label'] == 'Entailment', 'suggestionRH'],
                           name='Entailment').dropna(inplace=False).reset_index(drop=True)
    contradiction = pd.Series(matching_data.loc[matching_data[
                                                    'suggestionRH_label'] == 'Contradiction', 'suggestionRH'],
                              name='Contradiction').dropna(inplace=False).reset_index(
        drop=True)

    displayed_table = pd.concat([neutral, entailment, contradiction], axis=1)
    displayed_table["id"] = displayed_table.index + 1

    return displayed_table.to_dict(orient="records")

@app.get("/upload-submitted-graph")
def upload_submitted_graph(sentence1: str, sentence2: str):
    collation = Collation()
    data = pd.read_csv(f"data/NLI/submitted/cfs_example_submitted.tsv", sep="\t")
    # filter for lines with sentence1, sentence2 matching:
    print(data)
    matching_data = data[(data['sentence1'] == sentence1) & (data['sentence2'] == sentence2)]
    for i,line in enumerate(matching_data['suggestionRH']):
        collation.add_plain_witness(str(i), line)

    alignment_table = collate(collation)
    print(alignment_table)




@app.get("/upload-embeddings-plot", response_model=NLIEmbeddingResponse)
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
    print(response)
    return response.to_dict(orient="records")


@app.post("/submit-data")
async def submit_data(data_row: NLIDataSubmission):
    """
    Function receives a new submitted counterfactual and updates it in the submitted tsv file to store.
    """

    # read in the current tsv as well to remove if duplicated
    old_data = pd.read_csv(f"data/NLI/submitted/cfs_example_submitted.tsv", sep="\t")

    new_data = pd.DataFrame.from_dict([data_row])
    # we handle the duplicates here:
    data = pd.concat([old_data, new_data], ignore_index=True).replace('', np.nan, regex=True,
                                                                      inplace=False)
    data.drop_duplicates(inplace=True)

    data.to_csv(f"data/NLI/submitted/cfs_example_submitted.tsv", index=False, header=True,
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
