import crypto from 'node:crypto';

export function getRandomBytes(length: number) {
  return new Uint8Array(crypto.randomBytes(length));
}
