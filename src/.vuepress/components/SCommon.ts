class EntryDetailExample {
  teochew: string;
  puj: string;
  mandarin: string;
  constructor(teochew: string, puj: string, mandarin: string) {
    this.teochew = teochew;
    this.puj = puj;
    this.mandarin = mandarin;
  }
}

class EntryDetailMeaningExample {
  meaning: string;
  examples: EntryDetailExample[];
  constructor(meaning: string, examples: EntryDetailExample[]) {
    this.meaning = meaning;
    this.examples = examples;
  }
}

class EntryDetails {
  meanings: EntryDetailMeaningExample[];
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

class Pronunciation {
  initial: string;
  final: string;
  tone: number;

  constructor(initial: string, final: string, tone: number) {
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
  Pronunciation,
}
