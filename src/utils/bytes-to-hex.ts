export function bytesToHex(bytes: Uint8Array): string {
  const result: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    result.push((bytes[i] < 16 ? '0' : '') + bytes[i].toString(16));
  }
  return result.join('');
}
