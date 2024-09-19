class Entry {
  constructor(entry_index, char, char_sim, initial, final, tone, cat, char_ref, details) {
    this.entry_index = entry_index;
    this.char = char;
    this.char_sim = char_sim;
    this.initial = initial;
    this.final = final;
    this.combination = initial + final + tone;
    this.tone = tone;
    this.cat = cat;
    this.char_ref = char_ref;
    this.details = details;
  }

  getCombination() {
    return this.combination;
  }
}

class Pronunciation {
  constructor(initial, final, tone) {
    this.initial = initial;
    this.final = final;
    this.tone = tone;
    this.combination = initial + final + tone;
  }

  getCombination() {
    return this.initial + this.final + this.tone;
  }
}

export {
  Entry,
  Pronunciation,
}
