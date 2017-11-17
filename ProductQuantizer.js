// @ts-check

class ProductQuantizer {
  constructor() {
    this.nbits = 8;
    this.ksub = 1 << this.nbits;
    this.max_points_per_cluster = 256;
    this.max_points = this.max_points_per_cluster * this.ksub;
    this.seed = 1234;
    this.niter = 25;
    this.eps = 1e-7;
  }

  /**
   * 
   * @param {FtZReader} ftzReader 
   */
  load(ftzReader) {
    this.dim = ftzReader.readInt32();
    this.nsubq = ftzReader.readInt32();
    this.dsub = ftzReader.readInt32();
    this.lastdsub = ftzReader.readInt32();

    this.centroids = ftzReader.readUInt32TypedArray(this.dim * this.ksub);
  }

  /**
   * 
   * @param {Number} m 
   * @param {Number} i 
   */
  get_centroids(m, i) {
    if (m == this.nsubq - 1) {
      return this.centroids[m * this.ksub * this.dsub + i * this.lastdsub];
    }

    return this.centroids[(m * this.ksub + i) * this.dsub];
  }

  /**
   * 
   * @param {Vector} x 
   * @param {*} codes 
   * @param {*} t 
   * @param {*} alpha 
   */
  mulcode(x, codes, t, alpha) {
    let res = 0.0;
    let d = this.dsub;
    let code = codes + this.nsubq * t;

    for (let m = 0; m < this.nsubq; m++) {
      let c = this.get_centroids(m, code[m]);
      
      if (m == this.nsubq - 1) {
        d = this.lastdsub;
      }
      
      for(let n = 0; n < d; n++) {
        res += x.data[m * this.dsub + n] * c[n];
      }
    }

    return res * alpha;
  }
}

module.exports = ProductQuantizer;
