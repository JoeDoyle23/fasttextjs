const SIGMOID_TABLE_SIZE = 512;
const MAX_SIGMOID = 8;
const LOG_TABLE_SIZE = 512;

class Model {
  constructor(input, output, args, seed) {
    this.wi = input;
    this.wo = output;
    this.args = args;
    //this.osz = this.wo.m;
    this.hsz = this.args.dim;
    this.negpos = 0;
    this.loss = 0.0;
    this.nexamples = 1;

    this.negatives = [];

    this.initSigmoid();
    this.initLog();
  }

  setQuantizePointer(qwi, qwo, qout) {
    this.qwi = qwi;
    this.qwo = qwo;
    if (qout) {
      //this.osz = this.qwo->getM();
    }
  }

  initSigmoid() {
    this.t_sigmoid = [];

    for (let i = 0; i < SIGMOID_TABLE_SIZE + 1; i++) {
      let x = (i * 2 * MAX_SIGMOID) / SIGMOID_TABLE_SIZE - MAX_SIGMOID;
      this.t_sigmoid[i] = 1.0 / (1.0 + Math.exp(-x));
    }
  }

  initLog() {
    this.t_log = [];
    for (let i = 0; i < LOG_TABLE_SIZE + 1; i++) {
      let x = (i + 1e-5) / LOG_TABLE_SIZE;
      this.t_log[i] = Math.log(x);
    }
  }

  setTargetCounts(counts) {
    // assert(counts.size() == osz_);
    if (this.args.loss == this.args.loss_name.ns) {
      initTableNegatives(counts);
    }

    if (this.args.loss == this.args.loss_name.hs) {
      buildTree(counts);
    }
  }

  initTableNegatives(counts) {
    let z = 0.0;
    for (let i = 0; i < counts.length; i++) {
      z += Math.pow(counts[i], 0.5);
    }

    for (let i = 0; i < counts.length; i++) {
      let c = Math.pow(counts[i], 0.5);
      for (let j = 0; j < c * NEGATIVE_TABLE_SIZE / z; j++) {
        this.negatives.push(i);
      }
    }

    shuffle(negatives);
  }

  shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
  }
}

module.exports = Model;
