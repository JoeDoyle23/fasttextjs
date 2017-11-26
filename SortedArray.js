class SortedArray {
  constructor() {
    this.data = [];
  }

  front () {
    return this.data[0];
  }

  insert (first, second) {
    this.data.push({
      first,
      second,
    });
  }

  remove () {
    this.data.pop();
  }

  size () {
    return this.data.length;
  }

  sort () {
    this.data.sort((a, b) => {
      return b.first - a.first;
    });
  }
}

module.exports = SortedArray;
