// @ts-check

const SIGMOID_TABLE_SIZE = 512;
const MAX_SIGMOID = 8;
const LOG_TABLE_SIZE = 512;

class Model {
  /**
   * 
   * @param {Matrix} input 
   * @param {Matrix} output 
   * @param {Agrs} args 
   * @param {Number} seed 
   */
  constructor(input, output, args, seed) {
    this.wi = input;
    this.wo = output;
    this.args = args;
    this.osz = this.wo.m;
    this.hsz = this.args.dim;
    this.negpos = 0;
    this.loss = 0.0;
    this.nexamples = 1;

    this.negatives = [];

    this.initSigmoid();
    this.initLog();
  }

  /**
   * 
   * @param {QMatrix} qwi 
   * @param {QMatrix} qwo 
   * @param {bool} qout 
   */
  setQuantizePointer(qwi, qwo, qout) {
    this.qwi = qwi;
    this.qwo = qwo;
    if (qout) {
      this.osz = this.qwo.getM();
    }
  }

  initSigmoid() {
    this.t_sigmoid = [];

    for (let i = 0; i < SIGMOID_TABLE_SIZE + 1; i++) {
      let x = (i * 2 * MAX_SIGMOID) / SIGMOID_TABLE_SIZE - MAX_SIGMOID;
      this.t_sigmoid[i] = 1.0 / (1.0 + Math.exp(-x));
    }
  }

  initLog() {
    this.t_log = [];
    for (let i = 0; i < LOG_TABLE_SIZE + 1; i++) {
      let x = (i + 1e-5) / LOG_TABLE_SIZE;
      this.t_log[i] = Math.log(x);
    }
  }

  setTargetCounts(counts) {
    if (this.args.loss == this.args.loss_name.ns) {
      initTableNegatives(counts);
    }

    if (this.args.loss == this.args.loss_name.hs) {
      buildTree(counts);
    }
  }

  initTableNegatives(counts) {
    let z = 0.0;
    for (let i = 0; i < counts.length; i++) {
      z += Math.pow(counts[i], 0.5);
    }

    for (let i = 0; i < counts.length; i++) {
      let c = Math.pow(counts[i], 0.5);
      for (let j = 0; j < c * NEGATIVE_TABLE_SIZE / z; j++) {
        this.negatives.push(i);
      }
    }

    this.shuffle(negatives);
  }

  shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
  }

  /**
   * 
   * @param {*} input 
   * @param {*} k 
   * @param {*} heap 
   * @param {*} hidden 
   * @param {*} output 
   */
  predict(input, k, heap, hidden, output) {
    heap.reserve(k + 1);

    this.computeHidden(input, hidden);

    if (this.args.loss == this.args.loss_name.hs) {
      this.dfs(k, 2 * this.osz - 2, 0.0, heap, hidden);
    } else {
      this.findKBest(k, heap, hidden, output);
    }

    std::sort_heap(heap.begin(), heap.end(), comparePairs);
  }

  computeHidden(input, hidden) {
    hidden.zero();

    for (let it = input.cbegin(); it != input.cend(); ++it) {
      if(this.quant) {
        hidden.addRow(this.qwi, it);
      } else {
        hidden.addRow(this.wi, it);
      }
    }
    
    hidden.mul(1.0 / input.length);
  }

  dfs(k, node, score, heap, hidden) {
    if (heap.size() == k && score < heap.front().first) {
      return;
    }

    if (tree[node].left == -1 && tree[node].right == -1) {
      heap.push_back(std::make_pair(score, node));
      std::push_heap(heap.begin(), heap.end(), comparePairs);
      
      if (heap.size() > k) {
        std::pop_heap(heap.begin(), heap.end(), comparePairs);
        heap.pop_back();
      }
      return;
    }

    let f;
    if (this.quant && this.args.qout) {
      f = sigmoid(this.qwo.dotRow(hidden, node - this.osz));
    } else {
      f = sigmoid(this.wo.dotRow(hidden, node - this.osz));
    }

    this.dfs(k, tree[node].left, score + Math.log(1.0 - f), heap, hidden);
    this.dfs(k, tree[node].right, score + Math.log(f), heap, hidden);
  }

  findKBest(k, heap, hidden, output) {
    this.computeOutputSoftmax(hidden, output);
    for (let i = 0; i < this.osz; i++) {
      if (heap.size() == k && Math.log(output[i]) < heap.front().first) {
        continue;
      }

      heap.push_back(std::make_pair(Math.log(output[i]), i));
      std::push_heap(heap.begin(), heap.end(), comparePairs);
      
      if (heap.size() > k) {
        std::pop_heap(heap.begin(), heap.end(), comparePairs);
        heap.pop_back();
      }
    }
  }

  computeOutputSoftmax(hidden, output) {
    if (this.quant && this.args.qout) {
      output.mul(this.qwo, hidden);
    } else {
      output.mul(this.wo, hidden);
    }

    let max = output[0], z = 0.0;
    for (let i = 0; i < this.osz; i++) {
      max = Math.max(output[i], max);
    }

    for (let i = 0; i < this.osz; i++) {
      output[i] = Math.exp(output[i] - max);
      z += output[i];
    }

    for (let i = 0; i < this.osz; i++) {
      output[i] /= z;
    }
  }
}

module.exports = Model;
