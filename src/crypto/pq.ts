import {
  eGCD_,
  greater,
  divide_,
  str2bigInt,
  equalsInt,
  isZero,
  bigInt2str,
  copy_,
  copyInt_,
  rightShift_,
  sub_,
  add_,
  one,
  bpe,
} from 'leemon';
import { hexToBytes, bytesToBigInt, getRandomInt } from '../utils';

function leemonBigIntToBytes(bigInt: number[]): Uint8Array {
  const str = bigInt2str(bigInt, 16);
  return hexToBytes(str);
}

function pqLeemon(what: number[]): [Uint8Array, Uint8Array, number] {
  const minBits = 64;
  const minLen = Math.ceil(minBits / bpe) + 1;
  let it = 0;
  let q: number;
  let lim: number;
  let g: number[], P: number[], Q: number[];
  const a = new Array(minLen);
  const b = new Array(minLen);
  const c = new Array(minLen);
  g = new Array(minLen);
  const z = new Array(minLen);
  const x = new Array(minLen);
  const y = new Array(minLen);

  for (let i = 0; i < 3; i++) {
    q = (getRandomInt(128) & 15) + 17;
    copyInt_(x, getRandomInt(1000000000) + 1);
    copy_(y, x);
    lim = 1 << (i + 18);

    for (let j = 1; j < lim; j++) {
      ++it;
      copy_(a, x);
      copy_(b, x);
      copyInt_(c, q);

      while (!isZero(b)) {
        if (b[0] & 1) {
          add_(c, a);
          if (greater(c, what)) {
            sub_(c, what);
          }
        }
        add_(a, a);
        if (greater(a, what)) {
          sub_(a, what);
        }
        rightShift_(b, 1);
      }

      copy_(x, c);
      if (greater(x, y)) {
        copy_(z, x);
        sub_(z, y);
      } else {
        copy_(z, y);
        sub_(z, x);
      }
      eGCD_(z, what, g, a, b);
      if (!equalsInt(g, 1)) {
        break;
      }
      if ((j & (j - 1)) == 0) {
        copy_(y, x);
      }
    }
    if (greater(g, one)) {
      break;
    }
  }

  divide_(what, g, x, y);

  if (greater(g, x)) {
    P = x;
    Q = g;
  } else {
    P = g;
    Q = x;
  }

  return [leemonBigIntToBytes(P), leemonBigIntToBytes(Q), it];
}

export function pqPrimeFactorization(pqBytes: Uint8Array): [Uint8Array, Uint8Array, number] | null {
  const pq = bytesToBigInt(pqBytes);
  let result: [Uint8Array, Uint8Array, number] | null = null;

  try {
    result = pqLeemon(str2bigInt(pq.toString(16), 16, Math.ceil(64 / bpe) + 1));
  } catch (error) {
    console.error(`PQ leemon factorization: ${error}`);
  }

  return result;
}
