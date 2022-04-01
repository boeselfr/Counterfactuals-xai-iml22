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
from pydantic_models.example_data_points import ExampleDataResponse
from pydantic_models.nli_data_point import NLIDataResponse, NLIDataPoint, NLIDataSubmission, NLISubmissionDisplay
from typing import Callable
from fastapi.responses import FileResponse
from bokeh.plotting import Figure
from bokeh.resources import CDN
from bokeh.embed import json_item
from bokeh.layouts import column
from bokeh.models import CustomJS, ColumnDataSource, Slider
from bokeh.sampledata.autompg import autompg
import json



app = FastAPI(
    title="Test Python Backend",
    description="""This is a template for a Python backend.
                   It provides acess via REST API.""",
    version="0.1.0",
)


# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/upload-data", response_model=NLIDataResponse)
def upload_data(split: str):
    data = pd.read_csv(f"data/NLI/original/{split}.tsv", sep="\t")
    # TODO generate suggestions here or have them precomputed in the tsv
    return data.to_dict(orient="records")


@app.get("/upload-submitted-data", response_model=NLISubmissionDisplay)
def upload_submitted_data(sentence1: str, sentence2: str):
    data = pd.read_csv(f"data/NLI/submitted/cfs_example_submitted.tsv", sep="\t")
    # filter for lines with sentence1, sentence2 matching:
    matching_data = data[(data['sentence1'] == sentence1) & (data['sentence2'] == sentence2)]
    # now reorder the table to show neutral entailment and contradiction
    neutral = pd.Series(matching_data.loc[matching_data['suggestionRH_label']=='Neutral', 'suggestionRH'], name='Neutral').dropna(inplace=False).reset_index(drop=True)
    entailment = pd.Series(matching_data.loc[matching_data['suggestionRH_label']=='Entailment', 'suggestionRH'], name='Entailment').dropna(inplace=False).reset_index(drop=True)
    contradiction = pd.Series(matching_data.loc[matching_data['suggestionRH_label']=='Contradiction', 'suggestionRH'], name='Contradiction').dropna(inplace=False).reset_index(drop=True)

    displayed_table = pd.concat([neutral, entailment, contradiction], axis=1)

    return displayed_table.to_dict(orient="records")

@app.get("/upload-embeddings-plot")
def upload_embeddings():
    # for now just upload the png of the embeddings:
    # for future upload emebddings of counterfactuals generated
    #path = "data/umap_all_edited.png"
    #return FileResponse(path, media_type="image/png")
    grouped = autompg.groupby("yr")
    mpg = grouped.mpg
    avg, std = mpg.mean(), mpg.std()
    years = list(grouped.groups)
    american = autompg[autompg["origin"] == 1]
    japanese = autompg[autompg["origin"] == 3]

    p = Figure(title="MPG by Year (Japan and US)")

    p.vbar(x=years, bottom=avg - std, top=avg + std, width=0.8,
           fill_alpha=0.2, line_color=None, legend="MPG 1 stddev")

    p.circle(x=japanese["yr"], y=japanese["mpg"], size=10, alpha=0.5,
             color="red", legend="Japanese")

    p.triangle(x=american["yr"], y=american["mpg"], size=10, alpha=0.3,
               color="blue", legend="American")

    p.legend.location = "top_left"
    return json.dumps(json_item(p, "myplot"))



@app.post("/submit-data")
async def submit_data(data_row: NLIDataSubmission):
    """
    Function receives a new submitted counterfactual and updates it in the submitted tsv file to store.
    """

    # read in the current tsv as well to remove if duplicated
    old_data = pd.read_csv(f"data/NLI/submitted/cfs_example_submitted.tsv", sep="\t")

    new_data = pd.DataFrame.from_dict([data_row])
    # we handle the duplicates here:
    data = pd.concat([old_data, new_data], ignore_index=True).replace('', np.nan, regex=True, inplace=False)
    data.drop_duplicates(inplace=True)

    data.to_csv(f"data/NLI/submitted/cfs_example_submitted.tsv", index=False, header=True, sep="\t")
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
