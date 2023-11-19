export function hexToBytesRaw(value: string, length?: number): number[] {
  if (!length) {
    length = Math.ceil(value.length / 2);
  }

  while (value.length < length * 2) {
    value = '0' + value;
  }

  const bytes: number[] = [];
  for (let i = 0; i < length; i++) {
    bytes.push(parseInt(value.slice(i * 2, i * 2 + 2), 16));
  }
  return bytes;
}
