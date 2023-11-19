export function xorBytes(bytes1: Uint8Array, bytes2: Uint8Array): Uint8Array {
  let bytes = new Uint8Array(bytes1.length);
  for (let i = 0; i < bytes1.length; i++) {
    bytes[i] = bytes1[i] ^ bytes2[i];
  }
  return bytes;
}
