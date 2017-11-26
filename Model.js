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
    this.quant = false;

    this.tree = [];

    this.negatives = [];
    this.t_sigmoid = new Float32Array(SIGMOID_TABLE_SIZE + 1);
    this.t_log = new Float32Array(LOG_TABLE_SIZE + 1);

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
    for (let i = 0; i < SIGMOID_TABLE_SIZE + 1; i++) {
      let x = (i * 2 * MAX_SIGMOID) / SIGMOID_TABLE_SIZE - MAX_SIGMOID;
      this.t_sigmoid[i] = 1.0 / (1.0 + Math.exp(-x));
    }
  }

  initLog() {
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

  /**
   * 
   * @param {Array} a 
   */
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
   * @param {Array} input 
   * @param {Number} k 
   * @param {Map} heap 
   * @param {Vector} hidden 
   * @param {Vector} output 
   */
  predict(input, k, heap, hidden, output) {
    this.computeHidden(input, hidden);

    if (this.args.loss == this.args.loss_name.hs) {
      this.dfs(k, 2 * this.osz - 2, 0.0, heap, hidden);
    } else {
      this.findKBest(k, heap, hidden, output);
    }
  }

  /**
   * 
   * @param {Array} input 
   * @param {Vector} hidden 
   */
  computeHidden(input, hidden) {
    hidden.data.fill(0);

    input.forEach((it) => {
      if(this.quant) {
        hidden.addRowByQMatrix(this.qwi, it);
      } else {
        hidden.addRowByMatrix(this.wi, it);
      }
    });
    
    hidden.mulByNum(1.0 / input.length);
  }

  dfs(k, node, score, heap, hidden) {
    if (heap.size() == k && score < heap.front().first) {
      return;
    }

    if (tree[node].left == -1 && tree[node].right == -1) {
      heap.insert(score, node);
      heap.sort();
      
      if (heap.size() > k) {
        heap.remove();
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

  /**
   * 
   * @param {Number} k 
   * @param {PriorityQueue} heap 
   * @param {Vector} hidden 
   * @param {Vector} output 
   */
  findKBest(k, heap, hidden, output) {
    this.computeOutputSoftmax(hidden, output);
    for (let i = 0; i < this.osz; i++) {
      let iLog = Math.log(output.data[i]);

      if (heap.size() == k && iLog < heap.front().first) {
        continue;
      }

      heap.insert(iLog, i);
      heap.sort();
        
      if (heap.size() > k) {
        heap.remove();
      }

    }
  }

  /**
   * 
   * @param {Vector} hidden 
   * @param {Vector} output 
   */
  computeOutputSoftmax(hidden, output) {
    if (this.quant && this.args.qout) {
      output.mulByQMatrix(this.qwo, hidden);
    } else {
      output.mulByMatrix(this.wo, hidden);
    }

    let max = output.data[0];
    let z = 0.0;

    for (let i = 0; i < this.osz; i++) {
      max = Math.max(output.data[i], max);
    }

    for (let i = 0; i < this.osz; i++) {
      output.data[i] = Math.exp(output.data[i] - max);
      z += output.data[i];
    }

    for (let i = 0; i < this.osz; i++) {
      output.data[i] /= z;
    }
  }
  
  /**
   * 
   * @param {Number} x 
   */
  sigmoid(x) {
    if (x < -MAX_SIGMOID) {
      return 0.0;
    } 
    
    if (x > MAX_SIGMOID) {
      return 1.0;
    }

    let i = (x + MAX_SIGMOID) * SIGMOID_TABLE_SIZE / MAX_SIGMOID / 2;
    return this.t_sigmoid[i];
  }
}

module.exports = Model;
