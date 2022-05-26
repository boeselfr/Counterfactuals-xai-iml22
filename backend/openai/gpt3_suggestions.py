import openai

# Note that running this script to completion will spend OpenAI API credits!
# You will need to create this secret key file, or use a different auth method to run this script.
openai.api_key_path = "openai_api_key.txt"

from abc import ABC, abstractmethod
from typing import List

import openai


ENTAILMENT_PROMPT = """\
Write a pair of sentences that have the same relationship as the previous examples. Examples:
1. In six states, the federal investment represents almost the entire contribution for providing civil legal services
to low-income individuals.
Implication: In 44 states, the federal investment does not represent the entire contribution for providing civil
legal services for people of low income levels.
2. But if it’s at all possible, plan your visit for the spring, autumn, or even the winter, when the big sightseeing
destinations are far less crowded.
Implication: This destination is most crowded in the summer.
3. 5 percent of the routes operating at a loss.
Implication: 95 percent of routes are operating at either profit or break-even.
4. 30 About 10 percent of households did not
Implication: Roughly ninety percent of households did this thing.
5. 5 percent probability that each part will be defect free.
Implication: Each part has a 95 percent chance of having a defect.
6.""", "Implication"

CONTRADICTION_PROMPT = """\
Write a pair of sentences that have the same relationship as the previous examples. Examples:
1. Dun Laoghaire is the major port on the south coast.
Contradiction: Dun Laoghaire is the major port on the north coast.
2. Leave the city by its eastern Nikanor Gate for a five-minute walk to Hof Argaman (Purple Beach), one
of Israel’s finest beaches.
Contradiction: Leave the city by its western Nikanor Gate for a fifty five minute walk to Hof Argaman.
3. Southwest of the Invalides is the Ecole Militaire, where officers have trained since the middle of the
18th century.
Contradiction: North of the Invalides is the Ecole Militaire, where officers have slept since the early 16th
century.
4. Across the courtyard on the right-hand side is the chateau’s most distinctive feature, the splendid
Francois I wing.
Contradiction: The Francois l wing can be seen across the courtyard on the left-hand side.
5. To the south, in the Sea of Marmara, lie the woods and beaches of the Princes’ Islands.
Contradiction: In the north is the Sea of Marmara where there are mountains to climb.
6.""", "Contradiction"

NEUTRAL_PROMPT = """\
Write a pair of sentences that have the same relationship as the previous examples. Examples:
1. Small holdings abound, and traditional houses sit low on the treeless hillsides.
Possibility: The hills were the only place suitable to build traditional houses.
2. The inner courtyard has a lovely green and blue mosaic of Neptune with his wife Amphitrite.
Possibility: The only colors used in the mosaic of Neptune and Amphitrite are green and blue.
3. Nathan Road, Central, and the hotel malls are places to look.
Possibility: The only places to look are Nathan Road, Central and hotel malls.
4. Make your way westward to the Pont Saint-Martin for a first view of the city’s most enchanting quarter,
the old tannery district known as Petite France.
Possibility: The only place to the west of Pont Saint-Martin is the old tannery district.
5. The artisans, tradespeople, and providers of entertainment (reputable and not so reputable) lived downtown
on the reclaimed marshlands north and east, in the area still known as Shitamachi.
Possibility: The only place where artisans, tradespeople and entertainers could live was in the marshlands to
the north and east.
6.""", "Possibility"

nli_class_to_gpt_prompt = dict(
    neutral=NEUTRAL_PROMPT,
    contradiction=CONTRADICTION_PROMPT,
    entailment=ENTAILMENT_PROMPT,
)


class Model(ABC):
    @abstractmethod
    def complete(self, prompt: str, n_completions: int) -> List[str]:
        pass


class OpenAIModel(Model):
    # https://beta.openai.com/docs/api-reference/completions/create
    default_kwargs = dict(
        presence_penalty=0.0,
        frequency_penalty=0.0,
        top_p=0.5,
        max_tokens=120,
        temperature=0.5,
        stop=["\n\n"]
    )

    def __init__(self, engine, **kwargs):
        self.engine = engine
        _kwargs = {}
        _kwargs.update(self.default_kwargs)
        _kwargs.update(kwargs)
        self.kwargs = _kwargs

    def complete(self, prompt: str, n_completions: int) -> List[str]:
        completion = openai.Completion.create(engine=self.engine, prompt=prompt, n=n_completions, **self.kwargs)
        return [x.text for x in completion.choices]


class CounterfactualsPrompter:

    def __init__(self, prompt_head: str, response_thing: str):
        self.prompt_head = prompt_head
        self.response_thing = response_thing

    def build_prompt(self, query: str) -> str:
        prompt = f"{self.prompt_head} {query}\n{self.response_thing}:"
        prompt = prompt.rstrip()  # OpenAI completion often perform worse when there are trailing spaces.
        return prompt


def main3(n_continuations=3, interactive=True, mnli_type="entailment", debug=True):
    prompt, response_thing = nli_class_to_gpt_prompt[mnli_type]
    prompter = CounterfactualsPrompter(prompt, response_thing)

    if interactive and not debug:
        input("Are you sure you want to use credits? Ctrl-C to quit. ENTER to continue.")

    model = OpenAIModel('text-davinci-002')

    queries = [
        "It is a good day in the corn fields of Nebraska.",
        "Justin Bieber is renowned for being the greatest pop artist of all time.",
        "Steven wanted to eat some discount sushi from Bahnhofstrasse.",
    ]

    for query in queries:
        prompt = prompter.build_prompt(query)
        batch_size = n_continuations
        if not debug:
            completions = model.complete(prompt, batch_size)
        else:
            completions = ["<dry run completion>"] * batch_size
        print(f"PROMPT: {prompt}")
        for c in completions:
            print(f"\t{c}")


if __name__ == "__main__":
    # main(10)
    main3(10, interactive=True, debug=False)
