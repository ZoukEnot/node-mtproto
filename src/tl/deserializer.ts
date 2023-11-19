import pako from 'pako';
import { parserMap } from './parser';
import { intsToLong } from '../utils';

export class Deserializer {
  buffer: ArrayBuffer;
  byteView: Uint8Array;
  dataView: DataView;
  offset: number;

  constructor(buffer: ArrayBuffer) {
    this.buffer = buffer;
    this.byteView = new Uint8Array(this.buffer);
    this.dataView = new DataView(
      this.buffer,
      this.byteView.byteOffset,
      this.byteView.byteLength,
    );
    this.offset = 0;
  }

  uint32(): number {
    const value = this.dataView.getUint32(this.offset, true);
    this.offset += 4;
    return value;
  }

  int32(): number {
    const value = this.dataView.getInt32(this.offset, true);
    this.offset += 4;
    return value;
  }

  long(): string {
    const high = this.uint32();
    const low = this.uint32();
    return intsToLong(low, high);
  }

  int128(): Uint8Array {
    return this.byteView.slice(this.offset, (this.offset += 16));
  }

  int256(): Uint8Array {
    return this.byteView.slice(this.offset, (this.offset += 32));
  }

  double(): number {
    const value = this.dataView.getFloat64(this.offset, true);
    this.offset += 8;
    return value;
  }

  string(): string {
    const decoder = new TextDecoder();
    return decoder.decode(this.bytes());
  }

  bytes(): Uint8Array {
    let length = this.byteView[this.offset++];
    if (length === 254) {
      length =
        this.byteView[this.offset++] |
        (this.byteView[this.offset++] << 8) |
        (this.byteView[this.offset++] << 16);
    }
    const bytes = this.byteView.slice(this.offset, (this.offset += length));

    while (this.offset % 4 !== 0) {
      this.offset++;
    }

    return bytes;
  }

  int(): number {
    return this.int32();
  }

  vector<T>(fn: () => T, bare = false): T[] {
    if (!bare) {
      this.int32();
    }

    const length = this.int32();
    const result: T[] = [];

    for (let i = 0; i < length; i++) {
      result.push(fn.call(this));
    }

    return result;
  }

  gzip<T>(): T {
    const gzippedBytes = this.bytes();
    const deserializer = new Deserializer(pako.inflate(gzippedBytes).buffer);
    return deserializer.predicate() as unknown as T;
  }

  mt_message(): any {
    const fn = parserMap.get(1538843921);
    return fn?.call(this);
  }

  predicate<T = any>(): T | undefined {
    const id = this.int32() >>> 0;
    const fn = parserMap.get(id);

    if (!fn) {
      console.log('Not found predicate with id:', id);
      return;
    }

    return fn.call(this);
  }
}
