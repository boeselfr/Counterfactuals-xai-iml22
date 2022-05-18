#!/usr/bin/env bash
poetry shell
git clone https://github.com/tongshuangwu/polyjuice.git
cd polyjuice
pip install -e .
python -m spacy download en_core_web_sm
python -c "import nltk; nltk.download('omw-1.4')"
