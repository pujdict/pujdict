class EntryDetailExample {
  constructor(teochew, puj, mandarin) {
    this.teochew = teochew;
    this.puj = puj;
    this.mandarin = mandarin;
  }
}

class EntryDetailMeaningExample {
  constructor(meaning, examples) {
    this.meaning = meaning;
    this.examples = examples;
  }
}

class EntryDetails {
  constructor(details) {
    // List of EntryDetailMeaningExample
    this.meanings = [];
    if (!details)
      return;
    let detailsSplit = details.split('\t');
    let len = parseInt(detailsSplit[0]);
    let index = 1;
    for (let i = 0; i < len; ++i) {
      let meaning = detailsSplit[index++];
      let nExamples = parseInt(detailsSplit[index++]);
      let examples = [];
      for (let j = 0; j < nExamples; ++j) {
        let teochew = detailsSplit[index++];
        let puj = detailsSplit[index++];
        let mandarin = detailsSplit[index++];
        let example = new EntryDetailExample(teochew, puj, mandarin);
        examples.push(example);
      }
      let meaningExample = new EntryDetailMeaningExample(meaning, examples);
      this.meanings.push(meaningExample);
    }
  }
}

class Entry {
  constructor(entry_index, char, char_sim, initial, final, tone, sp_nasal, cat, freq, char_ref, details) {
    this.entry_index = entry_index;
    this.char = char;
    this.char_sim = char_sim;
    this.initial = initial;
    this.final = final;
    this.combination = initial + final + tone;
    this.tone = parseInt(tone);
    this.sp_nasal = parseInt(sp_nasal);
    this.cat = parseInt(cat);
    this.freq = parseInt(freq);
    this.char_ref = char_ref;
    this.details = new EntryDetails(details);
  }
}

class Pronunciation {
  constructor(initial, final, tone) {
    this.initial = initial;
    this.final = final;
    this.tone = tone;
  }

  get combination() {
    return this.initial + this.final + this.tone;
  }

  clone() {
    return new Pronunciation(this.initial, this.final, this.tone);
  }
}

export {
  Entry,
  Pronunciation,
}
