from __future__ import annotations
from typing import List, TypedDict
from pydantic import BaseModel


class NLIDataPoint(TypedDict):
    """
    sentence 1: premise
    sentence 2: hypothesis
    gold_label: label of relationship
    suggestionRP: suggested counterfactual by manipulating the premise
    suggestionRP_label: (not sure aboput this one) suggested label from a model?
    suggestionRH: suggested counterfactual by manipulating the hypothesis
    suggestionRHlabel: (not sure aboput this one) suggested label from a model?
    """
    sentence1: str
    sentence2: str
    gold_label: str
    suggestionRP: str
    suggestionRP_label: str
    suggestionRH: str
    suggestionRH_label: str


class NLIDataSubmission(TypedDict):
    sentence1: str
    sentence2: str
    gold_label: str
    suggestionRP: str
    suggestionRP_label: str
    suggestionRH: str
    suggestionRH_label: str
    estimated_similarity: float


class NLISubmissionDisplayPoint(TypedDict):
    Neutral: str
    Entailment: str
    Contradiction: str


class NLISubmissionDisplay(BaseModel):
    __root__: List[NLISubmissionDisplayPoint]


class NLIDataResponse(BaseModel):
    __root__: List[NLIDataPoint]

    class Config:
        schema_extra = {
            "example": [{
                "sentence1": "The girl in yellow shorts has a tennis ball in her left pocket.",
                "sentence2": "A girl with a tennis ball in her bag.",
                "gold_label": "Entailment",
                "suggestionRP": "The girl in yellow shorts has no tennis ball.",
                "suggestionRP_label": "contradiction",
                "suggestionRH": "A girl with a tennis ball in her hand.",
                "suggestionRH_label": "contradiction",

            }]
        }

