
entry_index = 0

class Entry:
    def __init__(self, char, char_sim, initial, final, tone, cat):
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

    def __str__(self):
        return self.entry_index + '\t' + self.char + '\t' + self.char_sim + '\t' + self.initial + '\t' + self.final + '\t' + self.tone + '\t' + self.cat

