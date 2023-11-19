import crypto from 'node:crypto';

export async function SHA256(data: Iterable<number>) {
  const arr = new Uint8Array(data);
  const hash = crypto.createHash('sha256');

  hash.update(arr);

  return new Uint8Array(hash.digest());
}
