import itertools
from typing import List, Optional, Sequence, Union

import benepar
import numpy as np
import pandas as pd
import polyjuice
import spacy
import torch
from nltk import ParentedTree, Tree
from polyjuice import generations
from polyjuice.generations import special_tokens
from tqdm import tqdm as tq
from random import sample

nlp = spacy.load("en_core_web_sm")
benepar.download('benepar_en3')
nlp.add_pipe('benepar', config={'model': 'benepar_en3'})


def add_indices_to_terminals(treestring):
    tree = ParentedTree.fromstring(treestring)
    for idx, _ in enumerate(tree.leaves()):
        tree_location = tree.leaf_treeposition(idx)
        non_terminal = tree[tree_location[:-1]]
        non_terminal[0] = non_terminal[0] + "_" + str(idx)
    return str(tree)


def find_constituent(node, candidate_list):
    if len(node) == 1 and type(node[0]) == str:
        idx = int(node[0].split("_")[-1])
        return idx, idx + 1

    first_idx = last_idx = 0
    for i in range(len(node)):
        idx = find_constituent(node[i], candidate_list)
        if i == 0:
            first_idx = idx[0]
        last_idx = idx[1]
    candidate_list.append((first_idx, last_idx))
    return first_idx, last_idx + 1


def find_blank_index(sentence):
    doc = nlp(sentence)
    sent = list(doc.sents)[0]
    tree_str = add_indices_to_terminals(sent._.parse_string)
    tree = Tree.fromstring(tree_str)
    tree.collapse_unary(collapsePOS=True)
    candidate_list = []
    blanked_sentences = []
    find_constituent(tree, candidate_list)
    sentence_list = sentence.split()
    for first_idx, last_idx in candidate_list:
        if last_idx + 1 < len(sentence) and first_idx > 0:
            blanked_sentences.append(
                " ".join(sentence_list[:first_idx]) + " [BLANK] " + " ".join(
                    sentence_list[last_idx + 1:]))
        elif first_idx > 0:
            blanked_sentences.append(" ".join(sentence_list[:first_idx]) + " [BLANK]")
        elif last_idx + 1 < len(sentence):
            blanked_sentences.append("[BLANK] " + " ".join(sentence_list[last_idx + 1:]))
        else:
            blanked_sentences.append("[BLANK]")

    return blanked_sentences


def get_prompts_v2(doc, ctrl_codes, blanked_sents, model_predict_blanks=True):
    """An improved version of polyjuice.generations.get_prompts()."""
    # `is_complete_blank=False` (default for perturb()) will not add
    # a SEP token at the end. This will cause the

    prompts = []
    if model_predict_blanks:
        # Don't add a SEP, so the that model can get a chance to
        # predict the blanks associated with the control codes.
        ending = ""
    else:
        ending = " " + special_tokens.SEP_TOK
    for ctrl_code, blanked_sent in itertools.product(ctrl_codes, blanked_sents):
        prompts.append(
            f"{doc.text.strip()} {special_tokens.PERETURB_TOK} "
            f"[{ctrl_code}] {blanked_sent.strip()}{ending}".strip()
        )
    return prompts


class PolyBetter(polyjuice.Polyjuice):
    """Improved version of Polyjuice."""

    def __init__(
            self,
            model_path="uw-hai/polyjuice",
            is_cuda=None,
    ):
        if is_cuda is None:
            is_cuda = torch.cuda.is_available(),
        super().__init__(model_path=model_path,
                         is_cuda=is_cuda)

    def perturb_better(
            self,
            orig_sent,
            blanked_sent: Union[str, Sequence[str]] = None,
            model_predict_blanks: bool = False,
            ctrl_code: Union[str, Sequence[str]] = None,
            n_results: int = 5,
            perplex_thred: int = 10,
            **kwargs,
    ):
        """Like polyjuice.Polyjuice.perturb(), except it can be guaranteed to
        return at least `n_results` return values."""
        if not self.validate_and_load_model("generator"):
            raise RuntimeError

        orig_doc = self._process(orig_sent) if type(orig_sent) == str else orig_sent

        if blanked_sent:
            blanked_sents = [blanked_sent] if type(blanked_sent) == str else blanked_sent
        else:
            # TODO(shwang): Maybe increase num of blank sentences..
            blanked_sents = self.get_random_blanked_sentences(
                orig_doc.text,
                max_blank_sent_count=10,
            )
        assert len(blanked_sents) >= 1

        if ctrl_code:
            ctrl_codes = [ctrl_code] if type(ctrl_code) == str else ctrl_code
            if not set(ctrl_codes).issubset(generations.ALL_CTRL_CODES):
                diff = set(ctrl_codes) - generations.ALL_CTRL_CODES
                raise ValueError(f"{diff} is not a valid ctrl code."
                                 "Please choose from {generations.ALL_CTRL_CODES}.")
        else:
            ctrl_codes = generations.RANDOM_CTRL_CODES

        prompts = get_prompts_v2(
            doc=orig_doc,
            ctrl_codes=ctrl_codes,
            blanked_sents=blanked_sents,
            model_predict_blanks=model_predict_blanks,
        )

        results = set()
        for _ in range(100):
            generated = generations.generate_on_prompts(
                generator=self.generator,
                prompts=prompts,
                n=10,
                **kwargs,
            )
            merged = list(np.concatenate(generated))
            for ctrl_code, candidate in merged:
                # TODO(shwang): Introduce perplexity validator?
                results.add(candidate)
            if len(results) >= n_results:
                break
        if len(results) < n_results:
            raise RuntimeError(
                f"Failed to produce {n_results}. "
                f"Could only produce {len(results)}."
            )
        return list(results)


_pj_cached: Optional[PolyBetter] = None


def init_pj() -> None:
    global _pj_cached
    if _pj_cached is None:
        _pj_cached = PolyBetter()


def get_pj() -> PolyBetter:
    init_pj()
    return _pj_cached


def _replace_word_with_blank2(sentence: str, n_results: int) -> [str]:
    """
    Blank constituents in a sentence. If the number of constituents * contorl codes is
    larger than number of desired results (n_results) sample the blanked sentences.
    An alternative commented methods is implemented, where we randomly generate blanks.
    The random function does not care about constituents
    Args:
        sentence: original sentence
        n_results: desired number of counterfactuals

    Returns: list of blanked sentences

    """
    # uncomment the following function if random blank generation is desired:
    # random_blanks = get_pj().get_random_blanked_sentences(
    #     sentence=sentence,
    #     # only allow selecting from a preset range of token indexes
    #     pre_selected_idxes=None,
    #     # only select from a subset of dep tags
    #     deps=None,
    #     # blank sub-spans or just single tokens
    #     is_token_only=False,
    #     # maximum number of returned index tuple
    #     max_blank_sent_count=3,
    #     # maximum number of blanks per returned sentence
    #     max_blank_block=1
    # )
    blanked_hypos = find_blank_index(sentence)
    req_blanks = int((n_results + 1) / len(generations.ALL_CTRL_CODES))
    if len(blanked_hypos) > req_blanks:
        return sample(blanked_hypos, req_blanks)
    return blanked_hypos


def generate_nli_perturbations(
        premise: str,
        hypothesis: str,
        ctrl_code: Union[Sequence[str], str] = special_tokens.RANDOM_CTRL_CODES,
        n_results: int = 30,
) -> "List[str]":
    """
    We sample a prompt by concatenating the premise, the hypothesis
    with random blanks in it, and then a random control code from
    the list of control codes passed.

    :param premise: NLI premise.
    :param hypothesis:  NLI hypothesis. This is to be perturbed.
    :param ctrl_code:
    :param n_results: The minimum number of results to return.
    :return:
    """
    orig_sent = f"{premise} {hypothesis}"
    blanks_hyp = _replace_word_with_blank2(hypothesis, n_results)
    blanks = [f"{premise} {hypo2}" for hypo2 in blanks_hyp]

    pj = get_pj()
    perturbations = pj.perturb_better(
        orig_sent=orig_sent,
        blanked_sent=blanks,
        ctrl_code=ctrl_code,
        n_results=n_results,
    )
    return perturbations


def main():
    """Polyjuice memprof test"""
    pj = polyjuice.Polyjuice(
        model_path="uw-hai/polyjuice",
        is_cuda=False,
    )
    text = "It is great for kids."
    perturbations = pj.perturb(text)
    print(perturbations)


def main_v2():
    pj = PolyBetter(
        model_path="uw-hai/polyjuice",
        is_cuda=False,
    )
    text = "It is great for kids."
    n_requests = 30
    perturbations = pj.perturb_better(text, n_results=n_requests)
    print(
        f"Requested {n_requests} counterfactual candidates. Got {len(perturbations)} candidates.")
    print(perturbations)


def main_v3():
    premise = "The time for action is now."
    hypothesis = "It is never too late to do anything."
    n_requests = 30
    perturbations = generate_nli_perturbations(premise, hypothesis,
                                               n_results=n_requests)
    print(
        f"Requested {n_requests} counterfactual candidates. Got {len(perturbations)} candidates.")
    print(perturbations)


def add_row(premise, hypo, label, cf):
    empty_row = {"sentence1": premise, "sentence2": hypo, "gold_label": label,
                 "suggestionRP": "-", "suggestionRP_label": "-", "suggestionRH": cf,
                 "suggestionRH_label": "-"}
    return empty_row


def generate_cf_for_corpus():
    n_results = 20
    original_df = pd.read_csv("./data/NLI/original/train.tsv", sep="\t")
    cf_df = []
    t_count = len(original_df)
    for i, row in tq(original_df.iterrows(), total=t_count):
        premise = row["sentence1"]
        hypo = row["sentence2"]
        cf_sentences = generate_nli_perturbations(premise, hypo, n_results=n_results)
        cf_sentences = sample(cf_sentences, n_results)
        for cf in cf_sentences:
            if len(cf.split(".")) < 2:
                continue
            cf_df.append(add_row(premise, hypo, row["gold_label"], cf.split(".")[1]))
    cf_df = pd.DataFrame(cf_df)
    print(cf_df.head())
    cf_df.to_csv("train_cf.csv")


if __name__ == "__main__":
    # main_v3()
    generate_cf_for_corpus()
