import itertools
from typing import List, Optional, Sequence, Union

import numpy as np
import polyjuice
from polyjuice import generations
from polyjuice.generations import special_tokens
import torch


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
                diff = set(ctrl_codes)-generations.ALL_CTRL_CODES
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


def _replace_word_with_blank2(sentence: str) -> str:
    random_blanks = get_pj().get_random_blanked_sentences(
        sentence=sentence,
        # only allow selecting from a preset range of token indexes
        pre_selected_idxes=None,
        # only select from a subset of dep tags
        deps=None,
        # blank sub-spans or just single tokens
        is_token_only=False,
        # maximum number of returned index tuple
        max_blank_sent_count=3,
        # maximum number of blanks per returned sentence
        max_blank_block=1
    )
    return list(random_blanks)[0]


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
    blanks_hyp = [_replace_word_with_blank2(hypothesis) for _ in range(n_results)]
    blanks = [f"{premise} {hypo2}" for hypo2 in blanks_hyp]
    print(orig_sent, blanks)

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
    print(f"Requested {n_requests} counterfactual candidates. Got {len(perturbations)} candidates.")
    print(perturbations)


def main_v3():
    premise = "The time for action is now."
    hypothesis = "It is never too late to do anything."
    n_requests = 30
    perturbations = generate_nli_perturbations(premise, hypothesis,
                                               n_results=n_requests)
    print(f"Requested {n_requests} counterfactual candidates. Got {len(perturbations)} candidates.")
    print(perturbations)


if __name__ == "__main__":
    main_v3()