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

  load(ftzReader) {
    this.dim = ftzReader.readInt32();
    this.nsubq = ftzReader.readInt32();
    this.dsub = ftzReader.readInt32();
    this.lastdsub = ftzReader.readInt32();

    this.centroids = ftzReader.readUInt32TypedArray(this.dim * this.ksub);
  }
}

module.exports = ProductQuantizer;
