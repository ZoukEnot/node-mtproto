import bigInt from 'big-integer';

export function intsToLong(low: number, high: number): string {
  return bigInt(low).shiftLeft(32).add(bigInt(high)).toString(10);
}
