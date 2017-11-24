class Matrix {
  constructor (m = 0, n = 0) {
    this.m = m;
    this.n = n;
    this.data = null;  
  }
  
  load(ftzReader) {
    this.m = ftzReader.readInt64();
    this.n = ftzReader.readInt64();
    this.data = ftzReader.readFloat32TypedArray(this.m * this.n);
  }

  /**
   * 
   * @param {Number} i 
   * @param {Number} j 
   */
  at(i, j) {
    return this.data[i * this.n + j];
  }

  /**
   * 
   * @param {Vector} vec 
   * @param {Nunber} i 
   */
  dotRow(vec, i) {
    let d = 0.0;
    for (let j = 0; j < this.n; j++) {
      d += this.at(i, j) * vec.data[j];
    }
    return d;
  }
}

module.exports = Matrix;
