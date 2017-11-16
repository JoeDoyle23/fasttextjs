const ProductQuantizer = require('./ProductQuantizer');

class QMatrix {
  load(ftzReader) {
    this.qnorm = ftzReader.readUInt8();
    this.m = ftzReader.readInt64();
    this.n = ftzReader.readInt64();
    this.codesize = ftzReader.readInt32();
    this.codes = ftzReader.readUInt8TypedArray(this.codesize);
    this.pq = new ProductQuantizer();
    this.pq.load(ftzReader);

    if (this.qnorm) {
      this.norm_codes = ftzReader.readUInt8TypedArray(this.m);
      this.npq = new ProductQuantizer();
      this.npq.load(ftzReader);
      }
  }
}

module.exports = QMatrix;
