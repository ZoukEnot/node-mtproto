import crypto from 'node:crypto';

export async function SHA1(data: Iterable<number>) {
  const arr = new Uint8Array(data);
  const hash = crypto.createHash('sha1');

  hash.update(arr);

  return new Uint8Array(hash.digest());
}
