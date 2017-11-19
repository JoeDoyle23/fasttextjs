const ProductQuantizer = require('./ProductQuantizer');

class QMatrix {
  constructor () {
    this.qnorm = false;
    this.m = 0;
    this.n = 0;
    this.codesize = 0;

    this.pq = new ProductQuantizer();
    this.npq = new ProductQuantizer();
  }

  /**
   * 
   * @param {FtzReader} ftzReader 
   */
  load(ftzReader) {
    this.qnorm = ftzReader.readUInt8();
    this.m = ftzReader.readInt64();
    this.n = ftzReader.readInt64();
    this.codesize = ftzReader.readInt32();
    this.codes = ftzReader.readUInt8TypedArray(this.codesize);
    this.pq.load(ftzReader);

    if (this.qnorm) {
      this.norm_codes = ftzReader.readUInt8TypedArray(this.m);
      this.npq.load(ftzReader);
      }
  }

  getM() {
    return this.m;
  }
  
  getN() {
    return this.n;
  }

  /**
   * 
   * @param {Vector} vec 
   * @param {Number} i 
   */
  dotRow(vec, i) {
    let norm = 1;

    if (this.qnorm) {
      norm = this.npq.get_centroids(0, this.norm_codes[i])[0];
    }

    return this.pq.mulcode(vec, this.codes, i, norm);
  }
}

module.exports = QMatrix;
