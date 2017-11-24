const MAX_VOCAB_SIZE = 30000000;
const MAX_LINE_SIZE = 1024;
const EOS = "</s>";
const BOW = "<";
const EOW = ">";

class Dictionary {
  /**
   * 
   * @param {Args} args 
   */
  constructor(args) {
    this.entry_type = {
      word: 0,
      label: 1
    };

    this.args = args;
    this.words = [];
    this.word2int = new Int32Array(MAX_VOCAB_SIZE);
    this.word2int.fill(-1);
    this.pruneidx = new Map();
    this.pdiscard = [];
  }

  /**
   * 
   * @param {FtzReader} ftzReader 
   */
  load(ftzReader) {
    this.size = ftzReader.readInt32();
    this.nwords = ftzReader.readInt32();
    this.nlabels = ftzReader.readInt32();
    this.ntokens = ftzReader.readInt64();
    this.pruneidx_size = ftzReader.readInt64();
    
    for (let i = 0; i < this.size; i++) {
      let c;
      const e = {
        word: '',
        count: 0,
        type: 0,
        subwords: []
      };

      e.word = ftzReader.readString();
      e.count = ftzReader.readInt64();
      e.type = ftzReader.readUInt8();

      this.words.push(e);
      let f = this.find(e.word);
      this.word2int[f] = i;
    }

    for (let i = 0; i < this.pruneidx_size; i++) {
      let first = ftzReader.readInt32();
      let second = ftzReader.readInt32();
      this.pruneidx.set(first, second);
    }

    this.initTableDiscard();
    this.initNgrams();
  }

  /**
   * 
   * @param {String} word 
   */
  hash (word) {
    let h = 0x811c9dc5;
    for (let i = 0; i < word.length; i++) {
      h ^= word.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }

    return h >>> 0;
  }

  /**
   * 
   * @param {String} word 
   * @param {Number} hash 
   */
  find (word, hash) {
    if (!hash) {
      hash = this.hash(word);
    }

    let id = hash % MAX_VOCAB_SIZE;

    while (this.word2int[id] !== -1 && this.words[this.word2int[id]] && this.words[this.word2int[id]].word !== word) {
      id = (id + 1) % MAX_VOCAB_SIZE;
    }
    return id;
  }
  
  initTableDiscard () {
    for (let i = 0; i < this.size; i++) {
      let f = this.words[i].count / this.ntokens;
      this.pdiscard[i] = Math.sqrt(this.args.t / f) + this.args.t / f;
    }
  }

  initNgrams() {
    for (let i = 0; i < this.size; i++) {
      let word = BOW + this.words[i].word + EOW;
      this.words[i].subwords = [];
      this.words[i].subwords.push(i);
      if (this.words[i].word != EOS) {
        this.computeSubwords(word, this.words[i].subwords);
      }
    }
  }

  /**
   * 
   * @param {String} word 
   * @param {Array} ngrams 
   */
  computeSubwords(word, ngrams) {
    for (let i = 0; i < word.length; i++) {
      let ngram;
      if ((word.charCodeAt(i) & 0xC0) == 0x80) continue;
      
      for (let j = i, n = 1; j < word.length && n <= this.args.maxn; n++) {
        ngram.push(word[j++]);

        while (j < word.length && (word.charCodeAt(j) & 0xC0) == 0x80) {
          ngram.push(word[j++]);
        }

        if (n >= this.args.minn && !(n == 1 && (i == 0 || j == word.length))) {
          let h = this.hash(ngram) % this.args.bucket;
          this.pushHash(ngrams, h);
        }
      }
    }
  }

  /**
   * 
   * @param {Array} hashes 
   * @param {Number} id 
   */
  pushHash(hashes, id) {
    if (this.pruneidx_size == 0 || id < 0) return;
    if (this.pruneidx_size > 0) {
      if (this.pruneidx.has(id)) {
        id = this.pruneidx.get(id);
      } else {
        return;
      }
    }
    hashes.push(this.nwords + id);
  }

  /**
   * 
   * @param {Number} w 
   * @param {Number} h 
   */
  getId(w, h) {
    if (!h) {
      h = this.hash(w);
    }
    return this.word2int[h];
  }

  /**
   * 
   * @param {Number} entry_type 
   */
  getCounts(entry_type) {
    const counts = [];
    this.words.forEach((w) => {
      if (w.type === entry_type) {
        counts.push(w.count);
      }
    });

    return counts;
  }

  /**
   * 
   * @param {String} inputText 
   * @param {Array} words 
   * @param {Array} labels 
   */
  getLine(inputText, words, labels) {
    let word_hashes = [];
    let token;
    let ntokens = 0;

    words.length = 0;
    labels.length = 0;

    words.push(...inputText.split(' '));

    words.forEach((token) => {
      let h = this.hash(token);
      let wid = this.getId(token, h);
      let entry_type = wid < 0 ? this.getTypeByToken(token) : this.getTypeById(wid);

      ntokens++;

      if (entry_type == this.entry_type.word) {
        this.addSubwords(words, token, wid);
        word_hashes.push(h);
      } else if (entry_type == this.entry_type.label && wid >= 0) {
        labels.push(wid - this.nwords);
      }
    });

    this.addWordNgrams(words, word_hashes, this.args.wordNgrams);
    return ntokens;
  }

  /**
   * 
   * @param {Number} id 
   */
  getTypeById(id) {
    return this.words[id].type;
  }
  
  /**
   * 
   * @param {String} w 
   */
  getTypeByToken(w) {
    return w.startsWith(this.args.label) ? this.entry_type.label : this.entry_type.word;
  }

  /**
   * 
   * @param {Number} id 
   */
  getSubwordsById(id) {
    return this.words[id].subwords;
  }

  /**
   * 
   * @param {Number} lid 
   */
  getLabel(lid) {
    return this.words[lid + this.nwords].word;
  }

  /**
   * 
   * @param {Array} line 
   * @param {String} token 
   * @param {NUmber} wid 
   */
  addSubwords(line, token, wid) {
    if (wid < 0) { // out of vocab
     this.computeSubwords(BOW + token + EOW, line);
    } else {
      if (this.args.maxn <= 0) { // in vocab w/o subwords
        line.push(wid);
      } else { // in vocab w/ subwords
        let ngrams = this.getSubwordsById(wid);
        line.push(...ngrams);
      }
    }
  }
 
  addWordNgrams(line, hashes, n) {
    for (let i = 0; i < hashes.length; i++) {
      let h = hashes[i];
      for (let j = i + 1; j < hashes.length && j < i + n; j++) {
        h = h * 116049371 + hashes[j];
        this.pushHash(line, h % this.args.bucket);
      }
    }
  }
}

module.exports = Dictionary;
