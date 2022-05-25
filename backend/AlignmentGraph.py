import collatex


class AlignmentGraph:
    def __init__(self, alignment_table: collatex.core_classes.AlignmentTable, n_sentences):
        # initiates the graph from the table instance
        self.sentences = n_sentences
        self.alignment_table = alignment_table
        self.occurrences = dict()
        self.occurrences["ALL_SENTENCES"] = self.sentences
        self.levels, self.levels_string = self.build_levels()
        # as d3 has problem with the same node name on different levels we add an index if a word occurs again
        self.levels, self.levels_string = self.remove_duplicate_names()


    def __getworddict(self, word, list):
        # find dict in list with id == word
        for id, el in enumerate(list):
            if el['id'] == word:
                return id, el
        return None, None

    def build_levels(self):
        levels = []
        for i, col in enumerate(self.alignment_table.columns):
            # one level per column:
            level = Level()
            # go through the witnesses
            for j, (key, text) in enumerate(col.tokens_per_witness.items()):
                # add non empty to the vis
                word = text[0].token_string
                if word not in ['', '-', '.', ',']:
                    # if word is already there is handled by the Level class
                    # add parent: this will be none for index 0
                    parent = None
                    # need to look through all past columns to find next string token
                    for down_iter in range(i):
                        try:
                            parent = self.alignment_table.columns[i - down_iter - 1].tokens_per_witness[key][
                                0].token_string
                            break
                        except Exception as e:
                            pass

                    level.add_word(word)

                    if parent not in [None, '-', '', ' ']:
                        # add an occurrence
                        if parent + '_' + word in self.occurrences.keys():
                            self.occurrences[parent + '_' + word] += 1
                            self.occurrences[parent] += 1
                        # create mapping but not parent
                        elif parent in self.occurrences.keys():
                            self.occurrences[parent + '_' + word] = 1
                            self.occurrences[parent] += 1
                        # need to add mapping and parent
                        else:
                            self.occurrences[parent + '_' + word] = 1
                            self.occurrences[parent] = 1

                        level.add_parent(word, parent)

            if level.get_list() != []:
                levels.append(level)

        # make sure that no id is there twice: else add additional spaces to the next ones
        return levels, [l.get_list() for l in levels]


    def remove_duplicate_names(self):
        placeholder = ' '
        all_ids = set()
        cleaned_levels = self.levels.copy()

        for i, level in enumerate(cleaned_levels):
            for j,id in enumerate(level.ids):
                if id in all_ids:
                    # need to change the id and all lower parent names
                    cleaned_levels[i].ids[j] = id + placeholder
                    # change the key of the parents attribute:
                    cleaned_levels[i].parents[id + placeholder] = cleaned_levels[i].parents.pop(id)
                    # go through all deeper levels:
                    for k,deeper_level in enumerate(cleaned_levels):
                        if k > i:
                            # change all parents == id to new name
                            # TODO need to distinguish to find whos parent it actually is
                            for key, val in deeper_level.parents.items():
                                if id in val:
                                    cleaned_levels[k].parents[key] = [id + placeholder if p == id else p for p in cleaned_levels[k].parents[key]]
                    # add new name to set:
                    all_ids.add(id + placeholder)
                # else: add id:
                all_ids.add(id)

        return cleaned_levels, [l.get_list() for l in cleaned_levels]


class Level:
    def __init__(self):
        self.ids = []
        self.parents = dict()

    def add_word(self, word):
        # redundant check to not add empty stuff:
        if word not in ['', '-', '.', ',']:
            if word not in self.ids:
                self.ids.append(word)
                self.parents[word] = []

    def add_parent(self, word, parent):
        if word not in ['', '-', '.', ','] and parent not in ['', '-', '.', ',']:
            if word in self.ids and parent not in self.parents[word]:
                self.parents[word].append(parent)

    def get_list(self):
        level = []
        for id in self.ids:
            dic = dict()
            dic['id'] = id
            dic['parents'] = self.parents[id]
            level.append(dic)
        return level
