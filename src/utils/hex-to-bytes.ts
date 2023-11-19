import { hexToBytesRaw } from './hex-to-bytes-raw';

export function hexToBytes(value: string, length?: number): Uint8Array {
  return new Uint8Array(hexToBytesRaw(value, length));
}
