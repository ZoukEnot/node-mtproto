import bigInt from 'big-integer';
import { bytesToHex } from './bytes-to-hex';

export function bytesToBigInt(bytes: Uint8Array): bigInt.BigInteger {
  return bigInt(bytesToHex(bytes), 16);
}
