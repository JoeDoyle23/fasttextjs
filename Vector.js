class Vector {
  constructor (m) {
    this.m = m;
    this.data = new Float64Array(m);
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
  
}

module.exports = Vector;
