export function concatBytes(...arrays: (Uint8Array | number[])[]): Uint8Array {
  let length = 0;

  for (let bytes of arrays) {
    length += bytes.length;
  }

  let result = new Uint8Array(length);
  let offset = 0;

  for (let bytes of arrays) {
    result.set(bytes, offset);
    offset += bytes.length;
  }

  return result;
}
