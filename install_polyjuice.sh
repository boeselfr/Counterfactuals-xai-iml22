#!/usr/bin/env bash
git clone https://github.com/tongshuangwu/polyjuice.git
cd polyjuice
pr="poetry run"
$pr pip install -e .
$pr python -m spacy download en_core_web_sm
$pr python -c "import nltk; nltk.download('omw-1.4')"
