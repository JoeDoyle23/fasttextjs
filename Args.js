// @ts-check

class Args {
  constructor() {
    this.model_name = {
      cbow: 1,
      sg: 2,
      sup: 3
    };
    
    this.loss_name = {
      hs: 1,
      ns: 2,
      softmax: 3
    };

    this.lr = 0.05;
    this.dim = 100;
    this.ws = 5;
    this.epoch = 5;
    this.minCount = 5;
    this.minCountLabel = 0;
    this.neg = 5;
    this.wordNgrams = 1;
    this.loss = this.loss_name.ns;
    this.model = this.model_name.sg;
    this.bucket = 2000000;
    this.minn = 3;
    this.maxn = 6;
    this.thread = 12;
    this.lrUpdateRate = 100;
    this.t = 1e-4;
    this.label = "__label__";
    this.verbose = 2;
    this.pretrainedVectors = "";
    this.saveOutput = 0;
  
    this.qout = false;
    this.retrain = false;
    this.qnorm = false;
    this.cutoff = 0;
    this.dsub = 2;
  }

  /**
   * 
   * @param {FtzReader} ftzReader 
   */
  load(ftzReader) {
    this.dim = ftzReader.readInt32();
    this.ws = ftzReader.readInt32();
    this.epoch = ftzReader.readInt32();
    this.minCount = ftzReader.readInt32();
    this.neg = ftzReader.readInt32();
    this.wordNgrams = ftzReader.readInt32();
    this.loss = ftzReader.readInt32();
    this.model = ftzReader.readInt32();
    this.bucket = ftzReader.readInt32();
    this.minn = ftzReader.readInt32();
    this.maxn = ftzReader.readInt32();
    this.lrUpdateRate = ftzReader.readInt32();
    this.t = ftzReader.readDouble();
  }
}

module.exports = Args;
