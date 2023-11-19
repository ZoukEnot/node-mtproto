import bigInt from 'big-integer';
import { hexToBytesRaw } from './hex-to-bytes-raw';

export function longToBytesRaw(value: number): number[] {
  const result = hexToBytesRaw(bigInt(value).toString(16), 8).reverse();
  return result;
}
