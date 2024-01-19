entry_index = 0


class Entry:
    def __init__(self, char, char_sim, initial, final, tone, cat, char_ref, details):
        global entry_index
        entry_index += 1
        self.entry_index = str(entry_index)
        self.char = char
        self.char_sim = char_sim
        self.initial = initial
        self.final = final
        self.combination = initial + final + tone
        self.tone = tone
        self.cat = cat
        self.char_ref = char_ref
        self.details = details

    def __str__(self):
        return self.entry_index + '\t' + self.char + '\t' + self.char_sim + '\t' + self.initial + '\t' + self.final + '\t' + self.tone + '\t' + self.cat + '\t' + self.char_ref + '\t' + self.details
