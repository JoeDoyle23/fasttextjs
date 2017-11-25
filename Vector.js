class Vector {
  constructor (m) {
    this.m = m;
    this.data = new Float32Array(m);
  }

  size() {
    return this.m;
  }
  
  zero() {
    this.data.fill(0.0);
  }
  
  /**
   * 
   * @param {Number} a 
   */
  mulByNum(a) {
    for (let i = 0; i < this.m; i++) {
      this.data[i] *= a;
    }
  }
  
  /**
   * 
   * @param {Matrix} a 
   * @param {Vector} vec 
   */
  mulByMatrix(a, vec) {
    for (let i = 0; i < this.m; i++) {
      this.data[i] = a.dotRow(vec, i);
    }
  }
  
  /**
   * 
   * @param {QMatrix} a 
   * @param {Vector} vec 
   */
  mulByQMatrix(a, vec) {
    for (let i = 0; i < this.m; i++) {
      this.data[i] = a.dotRow(vec, i);
    }
  }

  /**
   * 
   * @param {Matrix} A 
   * @param {Number} i 
   */
  addRowByMatrix(A, i) {
    for (let j = 0; j < A.n; j++) {
      this.data[j] += A.at(i, j);
    }
  }
  
  /**
   * 
   * @param {QMatrix} A 
   * @param {Number} i 
   */
  addRowByQMatrix(A, i) {
    A.addToVector(this, i);
  }
}

module.exports = Vector;
