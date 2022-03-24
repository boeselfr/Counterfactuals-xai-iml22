# Counterfactual Generation

[[_TOC_]]

## Team Members
1. Afra Amini
2. Frederic Boesel
3. Robin Chan
4. Steven H. Wang

## Project Description 
The project aims to improve [Polyjuice](https://arxiv.org/pdf/2101.00288.pdf), which is a framework for automated counterfactual generation by (a) letting lablers improve the polyjuice-generated counterfactuals though interaction with our dashboard and (b) extending Polyjuice control codes which it uses to generate the CFs. Finally, we want to have a rich, diverse, counterfactually-augmented dataset, which will be used to fine-tune roBERTa natural language inference (NLI) model and thereby improving generalizability compared to the original dataset. Scores will be compared to baselines defined in the polyjuice paper.  

### Users
The users of this dashboard are lablers of counterfactuals, fluent english speakers, i.e. lay users. 

### Datasets
The used dataset is the original Stanford NLI dataset as well as the manually counterfactually augmented SNLI dataset found [here](https://github.com/acmi-lab/counterfactually-augmented-data).

### Tasks
As described above, the main task solved by our dashboard is to be point of interaction to increase the level of human interaction with the counterfactual to generate a rich counterfactually augmented dataset. The rough individual tasks involved are:
- Create rough static backend/frontend structure for a set of pre-computed counterfactuals.
- Add interactive elements to the frontend.
- Implement reliable counterfactual generation with Polyjuice (and potentially using GPT-3).
- Add realtime counterfactual generation by wiring things up in our backend.
- Finetune roBERTa model by feeding in counterfactually augmented dataset.  

- - -
## Folder Structure
Specify here the structure of you code and comment what the most important files contain

``` bash
.
├── README.md
├── backend
│   ├── __pycache__
│   │   └── app.cpython-310.pyc
│   ├── app.py
│   ├── data # original counterfactually augmented dataset
│   │   ├── NLI
│   │   │   ├── all_combined
│   │   │   │   ├── dev.tsv
│   │   │   │   ├── test.tsv
│   │   │   │   └── train.tsv
│   │   │   ├── original
│   │   │   │   ├── cfs_example.tsv # this is a first mock sample
│   │   │   │   ├── dev.tsv
│   │   │   │   ├── snli_1.0_test.txt
│   │   │   │   ├── test.tsv
│   │   │   │   └── train.tsv
│   │   │   ├── revised_combined
│   │   │   │   ├── dev.tsv
│   │   │   │   ├── test.tsv
│   │   │   │   └── train.tsv
│   │   │   ├── revised_hypothesis
│   │   │   │   ├── dev.tsv
│   │   │   │   ├── test.tsv
│   │   │   │   └── train.tsv
│   │   │   └── revised_premise
│   │   │       ├── dev.tsv
│   │   │       ├── test.tsv
│   │   │       └── train.tsv
│   │   ├── dataset_blobs.csv
│   │   ├── dataset_circles.csv
│   │   ├── dataset_moons.csv
│   │   ├── generate_data.py
│   │   └── sentiment
│   │       ├── combined
│   │       │   ├── dev.tsv
│   │       │   ├── paired
│   │       │   │   ├── dev_paired.tsv
│   │       │   │   ├── test_paired.tsv
│   │       │   │   └── train_paired.tsv
│   │       │   ├── test.tsv
│   │       │   └── train.tsv
│   │       ├── new
│   │       │   ├── dev.tsv
│   │       │   ├── test.tsv
│   │       │   └── train.tsv
│   │       └── orig
│   │           ├── dev.tsv
│   │           ├── eighty_percent
│   │           │   ├── test.tsv
│   │           │   └── train.tsv
│   │           ├── test.tsv
│   │           └── train.tsv
│   ├── easy_polyjuice.py
│   └── pydantic_models
│       ├── __pycache__
│       │   ├── example_data_points.cpython-310.pyc
│       │   ├── example_data_points.cpython-39.pyc
│       │   └── nli_data_point.cpython-310.pyc
│       ├── example_data_points.py
│       └── nli_data_point.py
├── exploratory_notebooks
│   └── polyjuice.ipynb
├── poetry.lock
├── pyproject.toml
├── react-frontend
│   ├── README.md
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src
│   │   ├── App.css
│   │   ├── App.test.tsx
│   │   ├── App.tsx
│   │   ├── Visualization.tsx
│   │   ├── backend
│   │   │   ├── BackendQueryEngine.tsx
│   │   │   └── json-decoder.ts
│   │   ├── components
│   │   │   ├── BasicLineChart
│   │   │   │   ├── BasicLineChart.scss
│   │   │   │   ├── BasicLineChart.tsx
│   │   │   │   └── types.ts
│   │   │   ├── BoxCF
│   │   │   │   ├── BoxCF.tsx
│   │   │   │   └── boxcf.css
│   │   │   ├── BoxPolyjuice
│   │   │   │   ├── BoxPolyjuice.tsx
│   │   │   │   └── boxpolyjuice.css
│   │   │   ├── BoxSentencePair
│   │   │   │   ├── BoxSentencePair.tsx
│   │   │   │   └── boxsentencepair.css
│   │   │   ├── BoxTable
│   │   │   │   ├── BoxTable.tsx
│   │   │   │   └── boxtable.css
│   │   │   ├── DataPointComponent.tsx
│   │   │   └── ScatterPlot
│   │   │       ├── ScatterPlot.scss
│   │   │       ├── ScatterPlot.tsx
│   │   │       └── types.ts
│   │   ├── index.css
│   │   ├── index.tsx
│   │   ├── logo.svg
│   │   ├── react-app-env.d.ts
│   │   ├── reportWebVitals.ts
│   │   ├── setupTests.ts
│   │   ├── system.js
│   │   └── types
│   │       ├── DataArray.ts
│   │       ├── DataPoint.ts
│   │       ├── Margins.ts
│   │       ├── NLIDataArray.ts
│   │       └── NLIDataPoint.ts
│   └── tsconfig.json
└── requirements.txt # not directly contains the relevant dependencies, but is used by the poetry env
```

## Requirements

python = ">=3.9,<3.11"

## How to Run

1. Install poetry, a dependency management tool for Python, via the following command

    ```bash
    curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python
    ```

2. Clone this repository to your local, navigate into the folder and run

    ```bash
    poetry install
    ```

3. Navigate into backend folder, start backend

    ```bash
    uvicorn app:app --reload
    ```

4. Install node modules for react (in react-frontend) and start

    ```bash
    npm install
    npm start
    ```

## Milestones
Document here the major milestones of your code and future planned steps.\
- [x] Week 1
  - [x] Completed Sub-task: [#20984ec2](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/dummy-fullstack/-/commit/20984ec2197fa8dcdc50f19723e5aa234b9588a3)
  - [x] Completed Sub-task: ...

- [ ] Week 2
  - [ ] Sub-task: [#2](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/dummy-fullstack/-/issues/2)
  - [ ] Sub-task: ...

Create a list subtask.\
Open an issue for each subtask. Once you create a subtask, link the corresponding issue.\
Create a merge request (with corresponding branch) from each issue.\
Finally accept the merge request once issue is resolved. Once you complete a task, link the corresponding merge commit.\
Take a look at [Issues and Branches](https://www.youtube.com/watch?v=DSuSBuVYpys) for more details. 

This will help you have a clearer overview of what you are currently doing, track your progress and organise your work among yourselves. Moreover it gives us more insights on your progress.  

## Versioning
Create stable versions of your code each week by using gitlab tags.\
Take a look at [Gitlab Tags](https://docs.gitlab.com/ee/topics/git/tags.html) for more details. 

Then list here the weekly tags. \
We will evaluate your code every week, based on the corresponding version.

Tags:
- Week 1: [Week 1 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/dummy-fullstack/-/tags/stable-readme)
- Week 2: ..
- Week 3: ..
- ...


