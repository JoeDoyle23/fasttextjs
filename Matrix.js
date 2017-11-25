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
    let d = new Float32Array(1);
    for (let j = 0; j < this.n; j++) {
      d[0] += this.at(i, j) * vec.data[j];
    }
    return d[0];
  }
}

module.exports = Matrix;
