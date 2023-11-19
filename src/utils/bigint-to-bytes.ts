import bigInt from 'big-integer';
import { hexToBytes } from './hex-to-bytes';

export function bigIntToBytes(
  bigIntValue: bigInt.BigInteger,
  length?: number,
): Uint8Array {
  return hexToBytes(bigIntValue.toString(16), length);
}
