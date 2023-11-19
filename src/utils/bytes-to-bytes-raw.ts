export function bytesToBytesRaw(bytes: Uint8Array): number[] {
  const result: number[] = [];

  for (let i = 0; i < bytes.length; i++) {
    result.push(bytes[i]);
  }

  return result;
}
