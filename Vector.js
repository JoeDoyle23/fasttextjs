// @ts-check

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
  
  mulByNum(a) {
    for (let i = 0; i < this.m; i++) {
      this.data[i] *= a;
    }
  }
  
  mulByMatrix(a, vec) {
    for (let i = 0; i < this.m; i++) {
      this.data[i] = a.dotRow(vec, i);
    }
  }
  
  mulByQMatrix(a, vec) {
    for (let i = 0; i < this.m; i++) {
      this.data[i] = a.dotRow(vec, i);
    }
  }
  
}

module.exports = Vector;
