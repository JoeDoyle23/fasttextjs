const fs = require('fs');

const FASTTEXT_VERSION = 12;
const FASTTEXT_FILEFORMAT_MAGIC_INT32 = 793712314;

class FtzReader {
  constructor(modelFile) {
    this.position = 0;
    this.modelFile = modelFile;
  }

  open(callback) {
    fs.readFile(this.modelFile, (err, buffer) => {
      if (err) {
        return callback(err);
      }
        this.buffer = buffer;
        callback(null, this.isValid(this.readInt32(), this.readInt32()));
    });
  }

  isValid(magicNumber, fileVersion) {
    return magicNumber === FASTTEXT_FILEFORMAT_MAGIC_INT32 && fileVersion === FASTTEXT_VERSION;
  }

  readUInt8() {
    const value = this.buffer.readUInt8(this.position);
    this.position++;
    return value;
  }

  readInt32() {
    const value = this.buffer.readInt32LE(this.position);
    this.position+=4;
    return value;
  }

  readInt64() {
    let low = this.readInt32();
    let high = this.readInt32();

    return (high * 4294967296) + low;
  }

  readDouble() {
    const value = this.buffer.readDoubleLE(this.position);
    this.position+=8;
    return value;
  }

  readString() {
    let word = '';
    while (this.buffer[this.position] != 0) {
      word += String.fromCharCode(this.buffer[this.position]);
      this.position++;
    }
    // Move past null terminator
    this.position++;

    return word;
  }

  readUInt8TypedArray(length) {
    const data = new Uint8Array(length);
    this.buffer.copy(data, 0, this.position, this.position + length);
    this.position+=length;

    return data;
  }

  readUInt32TypedArray(length) {
    const data = new Uint8Array(length * 4);
    this.buffer.copy(data, 0, this.position, this.position + length * 4);
    this.position+=length * 4;

    return new Uint32Array(data);
  }
}

module.exports = FtzReader;
