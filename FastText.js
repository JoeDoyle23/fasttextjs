const Args = require('./Args');
const Dictionary = require('./Dictionary');
const QMatrix = require('./QMatrix');
const Model = require('./Model');
const FtzReader = require('./FtzReader');

class FastText {
  loadModel(modelPath, callback) {
    this.ftzReader = new FtzReader(modelPath);

    this.ftzReader.open((err, isOpen) => {
      this.args = new Args();
      this.args.load(this.ftzReader);

      this.dictionary = new Dictionary(this.args);
      this.dictionary.load(this.ftzReader);

      this.quant = !!this.ftzReader.readUInt8();

      if (this.quant) {
        this.qinput = new QMatrix();
        this.qinput.load(this.ftzReader);
      }

      this.args.qout = !!this.ftzReader.readUInt8();
      if (this.quant && this.args.qout) {
        this.qoutput = new QMatrix();
        this.qoutput.load(this.ftzReader);
      }

      this.model = new Model(null, null, this.args, 0);
      this.model.quant = this.quant;
      this.model.setQuantizePointer(this.qinput, this.qoutput, this.args.qout);

      if (this.args.model == this.args.model_name.sup) {
        this.model.setTargetCounts(this.dictionary.getCounts(this.dictionary.entry_type.label));
      } else {
        this.model.setTargetCounts(this.dictionary.getCounts(this.dictionary.entry_type.word));
      }
      console.log(this.args);
      callback();
    });
  }

  predict(inputText, k, includeProb) {
    this.predictions = [];

    let words = [];
    let labels = [];

    this.predictions = [];

    this.dictionary.getLine(inputText, words, labels);

    if (words.length === 0) return;

    let hidden = new Map(this.args.dim);
    let output = new Map(this.dictionary.nlabels);
    let modelPredictions = new Map();;

    this.model.predict(words, k, modelPredictions, hidden, output);
    for (auto it = modelPredictions.cbegin(); it != modelPredictions.cend(); it++) {
      predictions.push_back(std::make_pair(it->first, dict_->getLabel(it->second)));
    }
    
    return predictions;
  }
}

module.exports = FastText;
