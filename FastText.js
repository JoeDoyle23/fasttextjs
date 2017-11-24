const Args = require('./Args');
const Dictionary = require('./Dictionary');
const Matrix = require('./Matrix');
const QMatrix = require('./QMatrix');
const Model = require('./Model');
const PriorityQueue = require('./PriorityQueue');
const Vector = require('./Vector');
const FtzReader = require('./FtzReader');

class FastText {
  constructor () {
    this.input = new Matrix();
    this.output = new Matrix();
    this.qinput = new QMatrix();
    this.qoutput = new QMatrix();
    
    this.quant = false;
  }

  /**
   * 
   * @param {String} modelPath 
   * @param {function} callback 
   */
  loadModel(modelPath, callback) {
    this.ftzReader = new FtzReader(modelPath);

    this.ftzReader.open((err, isOpen) => {
      this.args = new Args();
      this.args.load(this.ftzReader);

      this.dictionary = new Dictionary(this.args);
      this.dictionary.load(this.ftzReader);

      this.quant = !!this.ftzReader.readUInt8();

      if (this.quant) {
        this.qinput.load(this.ftzReader);
      } else {
        this.input.load(this.ftzReader);
      }

      this.args.qout = !!this.ftzReader.readUInt8();
      if (this.quant && this.args.qout) {
        this.qoutput.load(this.ftzReader);
      } else {
        this.output.load(this.ftzReader);
      }

      console.log(this.output.data);
      this.model = new Model(this.input, this.output, this.args, 0);
      this.model.quant = this.quant;
      this.model.setQuantizePointer(this.qinput, this.qoutput, this.args.qout);

      if (this.args.model == this.args.model_name.sup) {
        this.model.setTargetCounts(this.dictionary.getCounts(this.dictionary.entry_type.label));
      } else {
        this.model.setTargetCounts(this.dictionary.getCounts(this.dictionary.entry_type.word));
      }

      callback();
    });
  }

  /**
   * 
   * @param {String} inputText 
   * @param {Number} k 
   * @param {Number} numResults 
   */
  predict(inputText, k, numResults) {
    this.predictions = [];

    let words = [];
    let labels = [];

    this.predictions = [];

    this.dictionary.getLine(inputText, words, labels);

    if (words.length === 0) return;

    let hidden = new Vector(this.args.dim);
    let output = new Vector(this.dictionary.nlabels);
    let modelPredictions = new PriorityQueue();

    this.model.predict(words, k, modelPredictions, hidden, output);

    console.log(modelPredictions.heap);
    // modelPredictions.forEach((pred) => {
    //   this.predictions.push({
    //     a: pred.first,
    //     label: this.dictionary.getLabel(pred.second)
    //   });
    // })
    
    return this.predictions;
  }
}

module.exports = FastText;
