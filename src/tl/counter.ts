import { builderMap } from './builder';

export class Counter {
  count: number;

  constructor(fn: (params: any) => void, params: any) {
    this.count = 0;
    fn.call(this, params);
  }

  uint32(): void {
    this.count += 4;
  }

  int32(): void {
    this.count += 4;
  }

  long(): void {
    this.count += 8;
  }

  int128(): void {
    this.count += 16;
  }

  int256(): void {
    this.count += 32;
  }

  double(): void {
    this.count += 8;
  }

  bytes(bytes: Uint8Array | Array<number>): void {
    const { length } = bytes;

    if (length <= 253) {
      this.count += 1;
    } else {
      this.count += 4;
    }

    this.count += length;

    // Padding
    while (this.count % 4 !== 0) {
      this.count += 1;
    }
  }

  bytesRaw(bytes: Uint8Array | Array<number>): void {
    this.count += bytes.length;
  }

  string(value: string): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    this.bytes(bytes);
  }

  int(): void {
    this.int32();
  }

  Bool(value: boolean): void {
    this.count += 4;
  }

  has(value: any): number {
    return +!!(Array.isArray(value) ? value.length : value);
  }

  flag(fn: (value: any) => void, value: any): void {
    if (this.has(value)) {
      fn.call(this, value);
    }
  }

  flagVector(fn: (value: any) => void, value: any[]): void {
    if (value === undefined || value.length === 0) {
      return;
    }

    this.vector(fn, value);
  }

  vector(fn: (value: any) => void, value: any[]): void {
    this.count += 8;

    for (let i = 0; i < value.length; i++) {
      fn.call(this, value[i]);
    }
  }

  predicate(params: { _: string }, bare: boolean = false): void {
    const fn = builderMap[params._];
    fn.call(this, params);
  }
}
