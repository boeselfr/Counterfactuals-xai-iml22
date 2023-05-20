# Counterfactual Generation

Project Report: [Counterfactual_Generation.pdf](https://github.com/boeselfr/Counterfactuals-xai-iml22/blob/e434e955e559b8ae719f305e01fd5f3ef694135b/Counterfactual_Generation.pdf)

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

The users of this dashboard are labelers of counterfactuals, fluent english speakers, i.e. lay
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
├── Dockerfile
├── README.md
├── backend
│   ├── AlignmentGraph.py    <------------ Uses text sequence alignment algorithms as preprocessing step for creating variance graph.
│   ├── app.py
│   ├── data
│   │   ├── NLI # nli dataset, partially used
│   │   │   ├── all_combined
│   │   │   │   ├── dev.tsv
│   │   │   │   ├── test.tsv
│   │   │   │   └── train.tsv
│   │   │   ├── original
│   │   │   │   ├── cfs_example.tsv
│   │   │   │   ├── dev.tsv
│   │   │   │   ├── snli_1.0_test.txt
│   │   │   │   ├── test.tsv
│   │   │   │   └── train.tsv
│   │   │   ├── poly_cfs
│   │   │   │   ├── train_cf.csv
│   │   │   │   └── train_cf3.csv
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
│   │   ├── hidden_states.npz
│   │   ├── umap_all_edited.png
│   │   └── umap_mapper.pkl
│   ├── easy_polyjuice.py <----------------------- functions for polyjuice functionalities
│   ├── pydantic_models
│   │   ├── example_data_points.py
│   │   └── nli_data_point.py
│   ├── roberta_inference.py  <----------------- function for roberta counterfactual labeling
├── backend_launch.sh
├── classifiers
│   ├── README.md
│   ├── data.py
│   ├── tune.py
│   └── utils.py
├── exploratory_notebooks
│   └── polyjuice.ipynb
├── poetry.lock 
├── pyproject.toml # important poetry file containing poetry dependencies
├── react-frontend
│   ├── Dockerfile
│   ├── README.md
│   ├── package-lock.json
│   ├── package.json
│   ├── src # app and typescript components
|   |   | Visualization.tsx   <------------- Main app
|   |   | components/BoxPolyjuice/BoxPolyjuice.tsx  <----------- AI assisted CF writng component
|   |   | components/VarianceGraph/VarianceGraph.tsx  <----------- Text Variants Graph view of CFs
|   |   | components/BoxTable/BoxTable.tsx  <----------- Table view of CFs
│   │   ├── system.js
│   │   ├── types # datatypes
│   │   │   ├── DataArray.ts
│   │   │   ├── DataPoint.ts
│   │   │   ├── Margins.ts
│   │   │   ├── NLIDataArray.ts
│   │   │   ├── NLIDataPoint.ts
│   │   │   ├── NLIEmbeddingArray.ts
│   │   │   ├── NLIEmbeddingPoint.ts
│   │   │   ├── NLISubmissionDisplay.ts
│   │   │   ├── NLISubmissionDisplayGraph.ts
│   │   │   ├── NLISubmissionDisplayLevel.ts
│   │   │   ├── NLISubmissionDisplayNode.ts
│   │   │   └── NLISubmissionDisplayPoint.ts
│   │   ├── umap_all.png
│   │   ├── useTour.tsx 
│   │   └── useTour_button.tsx # typescript function for guided walkthough
│   └── tsconfig.json
└── umap_all.png
```

## Requirements

python = ">=3.9,<3.11"

## How to Run Manually (see **Docker instructions** at bottom of README)

1. Install poetry, a dependency management tool for Python, via the following command

    ```bash
    curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python
    ```

2. Clone this repository to your local, navigate into the folder and run

    ```bash
    poetry install
    poetry shell
    ```

3. Install Polyjuice from source: 
    ```bash
    ./install_polyjuice.sh
    ```
4. Launch the backend by running `./launch_backend.sh` OR navigate into backend folder and start backend

    ```bash
    cd backend
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

- [x] Week 7 (Spring Break)
    - [x] Front-end incremental improvements
    - [x] Integrate umap visualization
    - [x] Generate counterfactuals for the whole dataset using
      polyjuice [#fb309384](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/merge_requests/8)
    - [x] Go back and forth between the main sentences and update the rest of the dashboard
      correspondingly [#fb309384](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/merge_requests/8)
    - [x] Script for replicating polyjuice classifer fine-tuning
      results [#10](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/issues/10)
- [x] Week 8
  - [x] Heavy refactor with material-ui [#16](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/issues/16)
  - [x] Make project roadmap and slides for presentation to professor [#17](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/issues/17).
  - [ ] Time and document CPU and GPU polyjuice generation times [#15](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/issues/15).
  - [x] Create walkthrough instructions for users through the dashboard [#85d52b18](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/85d52b18036faffdbbdbd2988bd1c916a268b306)
- [ ] Week 9 & 10
  - [x] Dockerized the front- and backends: [#4c3f5685](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/4c3f568594980056a2fdff9f9251e48cb32813a7)
  - [x] Created a graph-display of the created counterfactuals: [#20](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commits/20-VarianceGraph)
  - [x] Extend walkthough and add manual toggle: [#da5e6d5f](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/da5e6d5fefac39e9e32f85c93466b189b82134de), [#cf9b26f7](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/cf9b26f787fd71f651745d1b191f9747108bcc4b)
  - [x] Add roBERTa suggested labels: [#bfbc35d8](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/bfbc35d849d71a04c6c610eaefba0240a9d03a42)
  - [ ] Interactive blank selection for polyjuice selection: [#8](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/issues/8), currently still on a separate branch due to dependency issues [#e888fadf](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/commit/e888fadf154ca21777825aeab8988237d77189ce)
- [ ] Week 11 & 12
  - [x] Revamp docker containers, add better install instructions for polyjuice: !15
  - [ ] Use different visual channels and modes of feedback for word tree visualization. (color, thickness, etc.)
  - [x] Experiment with OpenAI GPT queries: !20
  - [x] Re-do interaction workflow: !19

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
(and included them into the dashboard) as well as fine-tuning a roBERTa classifier to reproduce some of the results from the Polyjuice paper, where they showed that using counterfactual examples generated from their dashboard improved the classifier's performance on "challenge" datasets, while not hurting performance on the original dataset.
Further, we constructed lay-user-friendly walkthrough instructions to the dashboard. 
Finally, we defined a roadmap of upcoming tasks, which were discussed with the Professor. 

**Week 10**: The progress this week included first making the dashboard walkthough more lay-user friendly by adding some more instructions and adding the option to manually toggle a walkthrough. Further, we added features to make developing counterfactuals more easy to the lay user, namely: automatically alter a user-selected part of the suggestion based on user-input keyword, add some text visualizations of the generated counterfactuals and finally add a roBERTa suggested label. Finally, we dockerized our application (see instructions below).

**Week 12**: We added a new sentence tree visualization, replacing the old table of user submitted counterfactuals.
We experimented with OpenAI counterfactual suggestions and improve the Polyjuice counterfactual suggestions. Further, we reworked the visual interaction workflow of the UI to make the interaction more intuitive.

## Versioning

Reference. XaIML Schedule: https://docs.google.com/document/d/1qqaE6IMD2ETs0gxD21lwyvIUxh-3oSkGHbISOIWtPVQ/edit

Tags:

- Week
  3: [Week 3 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/tags/Week1)
- Week
  4: [Week 4 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/tags/Week2)
- Week
  5: [Week 5 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/tags/Week3)
- Week
  6 (April 14): [Week 6 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/tags/Week6)
- Week 8 (April 28): [Week 8 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/tags/Week8)
- Week 10 (May 12): [Week 10 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/tags/Week10)
  - Use `springulum/frontend:week10` and `springulum/backend:week10` Docker images.
- Week 12 (May 26): [Week 12 Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/tags/Week12)
    - Use `springulum/frontend:week12` and `springulum/backend:week12` Docker images.
- Final (June 13): [Final Submission Tag](https://gitlab.inf.ethz.ch/COURSE-XAI-IML22/Counterfactuals-xai-iml22/-/tags/final_submission)
    - Use `springulum/frontend:final` and `springulum/backend:final` Docker images.

## Launching the app with Docker

For now our Docker setup is only compatible with Linux, because we don't know how to set up container networking on MacOS yet.

You can launch the front and backend docker images on Ubuntu via
```
docker run -d --rm -it --net=host springulum/frontend:final  # Listens on port 8000, connects to backend port 3000
docker run -d --rm -it --net=host springulum/backend:final  # Listens on port 3000. Will download 2.0 GB of ML models upon launch.
```

You can then use the app by loading http://localhost:3000 in your web browser.
Using --net=host, a *Linux-only option*, will automatically bind containers ports 3000 and 8000 to localhost.
