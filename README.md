# Counterfactual Generation

[[_TOC_]]

## Team Members

1. Afra Amini
2. Frederic Boesel
3. Robin Chan
4. Steven H. Wang

## Project Description

The project aims to improve [Polyjuice](https://arxiv.org/pdf/2101.00288.pdf), which is a
framework for automated counterfactual generation by (a) letting lablers improve the
polyjuice-generated counterfactuals though interaction with our dashboard and (b) extending
Polyjuice control codes which it uses to generate the CFs. Finally, we want to have a rich,
diverse, counterfactually-augmented dataset, which will be used to fine-tune roBERTa natural
language inference (NLI) model and thereby improving generalizability compared to the original
dataset. Scores will be compared to baselines defined in the polyjuice paper.

### Users

The users of this dashboard are lablers of counterfactuals, fluent english speakers, i.e. lay
users.

### Datasets

The used dataset is the original Stanford NLI dataset as well as the manually counterfactually
augmented SNLI dataset
found [here](https://github.com/acmi-lab/counterfactually-augmented-data).

### Tasks

As described above, the main task solved by our dashboard is to be point of interaction to
increase the level of human interaction with the counterfactual to generate a rich
counterfactually augmented dataset. The rough individual tasks involved are:

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
│   ├── app.py
│   ├── data
│   │   ├── NLI
│   │   │   ├── all_combined
│   │   │   │   ├── dev.tsv
│   │   │   │   ├── test.tsv
│   │   │   │   └── train.tsv
│   │   │   ├── original
│   │   │   │   ├── cfs_example.tsv # static data used for testing
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
│   │   │   ├── revised_premise
│   │   │   │   ├── dev.tsv
│   │   │   │   ├── test.tsv
│   │   │   │   └── train.tsv
│   │   │   └── submitted
│   │   │       └── cfs_example_submitted.tsv
│   │   ├── generate_data.py
│   │   └── umap_all_edited.png
│   ├── easy_polyjuice.py
│   ├── pydantic_models
│   │   ├── __pycache__
│   │   │   ├── example_data_points.cpython-310.pyc
│   │   │   ├── example_data_points.cpython-39.pyc
│   │   │   └── nli_data_point.cpython-310.pyc
│   │   ├── example_data_points.py
│   │   └── nli_data_point.py
│   └── umap_visualization.py # create umap visualizations
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
│   │   ├── components # individual boxes in app.tsx
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
│   │   ├── types
│   │   │   ├── DataArray.ts
│   │   │   ├── DataPoint.ts
│   │   │   ├── Margins.ts
│   │   │   ├── NLIDataArray.ts
│   │   │   ├── NLIDataPoint.ts
│   │   │   ├── NLISubmissionDisplay.ts
│   │   │   └── NLISubmissionDisplayPoint.ts
│   │   └── umap_all.png
│   └── tsconfig.json
├── requirements.txt # implicitely used by poetry to setup venv
└── umap_all.png
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

3. Install Polyjuice from source: clone
   repo [from here](https://github.com/tongshuangwu/polyjuice). Then navigate to polyjuice
   folder and run:
    ```bash
    pip install -e .
    ```
4. Navigate into backend folder, start backend

    ```bash
    uvicorn app:app --reload
    ```

5. Install node modules for react (in react-frontend) and start

    ```bash
    npm install
    npm start
    ```

## Milestones

Document here the major milestones of your code and future planned steps.\

- [x] Week 3
    - [x] Create first draft of the
      frontend: [#c1e6dfec](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/c1e6dfec525ed0507b65c058c8a511eeed1f8d15)
    - [x] Upload data to backend and connect it to the draft of the
      frontend: [#781542e6](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/781542e6b207d95f2984ba026235dd231250495b)
    - [x] Explore polyjuice
      API: [#42e02967](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/405dff47b02ebfc327cb1b569a1ce286cfdc05df)

- [x] Week 4
    - [x] Add interactive functional elements to the
      frontend: [#4763df84](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/4763df841263e13f9bd73f9be5cc532b533038a8)
    - [x] Create static mock
      dataset: [#4763df84](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/4763df841263e13f9bd73f9be5cc532b533038a8)
    - [x] Add installation instructions for code
      reproducability: [#19ab819e](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/19ab819ea22cf6a230896048cea5c6912e5dfa95)
      , [#ebe5f4d3](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/ebe5f4d3009c03d635d202ac945b58a257a20b1e)
    - [x] Create easy NLI interface for
      polyjuice [#ab954dc7](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/ab954dc739d00600e928082f97b01614b4ff6f19)

- [x] Week 5
    - [x] Wire CF submission to display in the
      frontend: [#7ecb58bf](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/7ecb58bf30702d3c4e939a68fbac03ff2ca3eee1)
    - [x] Create high-dimensional visualizations for
      pre-activations: [#66b35361](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/66b353616bd51011792ae9e9beb58015a382cf92)
    - [x] Display first visualizations of pre-activations in
      frontend: [#9663a9bb](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/9663a9bbf0aca42e6bd089e78f5715158bbc093f)

- [x] Week 6
    - [x] Refactor umap
      visualization: [#1ba0f0ba0848](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/merge_requests/4/diffs?commit_id=11ba0f0ba0848c47086d9553892e87700896321c)
    - [x] Refactor frontend interactive
      components: [#79980775](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/799807754fad6ba509f430f6339dea12b0721d6c)
    - [ ] Integrate polyjuice into
      frontend: [#6](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/issues/6)
    - [ ] Dynamic counterfactual generation with
      polyjuice: [#12](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/issues/12)
      completed but not merged with the main since the generation takes considerable amount of
      time on CPU.

- [x] Week 7
    - [x] Front-end incremental improvements
    - [x] Integrate umap visualization
    - [x] Generate counterfactuals for the whole dataset using
      polyjuice [#fb309384](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/merge_requests/8)
    - [x] Go back and forth between the main sentences and update the rest of the dashboard
      correspondingly [#fb309384](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/merge_requests/8)
    - [x] Script for replicating polyjuice classifer fine-tuning
      results [#10](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/issues/10)
- [ ] Week 8
  - [x] Heavy refactor with material-ui [#16](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/issues/16)
  - [x] Make project roadmap and slides for presentation to professor [#17](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/issues/17).
  - [ ] Time and document CPU and GPU polyjuice generation times [#15](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/issues/15).
  - [x] Create walkthrough instructions for users through the dashboard [#85d52b18](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/85d52b18036faffdbbdbd2988bd1c916a268b306)

Create a list subtask.\
Open an issue for each subtask. Once you create a subtask, link the corresponding issue.\
Create a merge request (with corresponding branch) from each issue.\
Finally accept the merge request once issue is resolved. Once you complete a task, link the
corresponding merge commit.\
Take a look at [Issues and Branches](https://www.youtube.com/watch?v=DSuSBuVYpys) for more
details. This will help you have a clearer overview of what you are currently doing, track
your progress and organise your work among yourselves. Moreover it gives us more insights on
your progress.

## Weekly summary

**Week 6**: The progress this week included assessing the feasibility of using polyjuice in
real-time and accelerating it. For a good user-expericence few seconds of loading time would
be required, which is likely only possible if polyjuice is run on a GPU. Further changes
included improvements to the interactive components of the frontend components (such as
scrollable tables and improving button functionalities). Finally, we continued work on the
high-dimensional umap visualization of the pre-activations, which we are still unsure about
how to include in the dashboard to aid the user.

**Week 8**: The progress this week included creating a first set of polyjuice automatically generated counterfactuals
(and included them into the dashboard) as well as looking into fine-tuning a roBERTa classifier, which will
ultimately . Further, we constructed lay-user-friendly walkthrough instructions to the dashboard. 
Finally, we defined a roadmap of upcoming tasks, which were discussed with the Professor. 

## Versioning

Tags:

- Week
  3: [Week 3 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/tags/Week1)
- Week
  4: [Week 4 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/tags/Week2)
- Week
  5: [Week 5 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/tags/Week3)
- Week
  6: [Week 6 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/tags/Week6)
- Week 6: [Week 8 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/tags/Week8)

