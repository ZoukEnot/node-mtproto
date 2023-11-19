import bigInt from 'big-integer';
import { xorBytes, concatBytes, bigIntToBytes, bytesToBigInt } from '../utils';
import { getRandomBytes } from './get-random-bytes';
import { PBKDF2 } from './pbkdf2';
import { SHA256 } from './sha256';

interface SRPParams {
  g: number;
  p: Uint8Array;
  salt1: Uint8Array;
  salt2: Uint8Array;
  gB: Uint8Array;
  password: string;
}

export async function getSRPParams({
  g,
  p,
  salt1,
  salt2,
  gB,
  password,
}: SRPParams): Promise<{ A: Uint8Array; M1: Uint8Array }> {
  const H = SHA256;
  const SH = async (data: Uint8Array, salt: Uint8Array) => {
    return H(concatBytes(salt, data, salt));
  };
  const PH1 = async (
    password: string,
    salt1: Uint8Array,
    salt2: Uint8Array,
  ) => {
    return SH(await SH(new TextEncoder().encode(password), salt1), salt2);
  };
  const PH2 = async (
    password: string,
    salt1: Uint8Array,
    salt2: Uint8Array,
  ) => {
    return SH(
      // @ts-ignore
      await PBKDF2(await PH1(password, salt1, salt2), salt1, 100000),
      salt2,
    );
  };

  const gBigInt = bigInt(g);
  const gBytes = bigIntToBytes(gBigInt, 256);
  const pBigInt = bytesToBigInt(p);
  const aBigInt = bytesToBigInt(getRandomBytes(256));
  const gABigInt = gBigInt.modPow(aBigInt, pBigInt);
  const gABytes = bigIntToBytes(gABigInt, 256);
  const gBBytes = bytesToBigInt(gB);
  const [k, u, x] = await Promise.all([
    H(concatBytes(p, gBytes)),
    H(concatBytes(gABytes, gB)),
    PH2(password, salt1, salt2),
  ]);
  const kBigInt = bytesToBigInt(await k);
  const uBigInt = bytesToBigInt(await u);
  const xBigInt = bytesToBigInt(await x);
  const vBigInt = gBigInt.modPow(xBigInt, pBigInt);
  const kVBigInt = kBigInt.multiply(vBigInt).mod(pBigInt);
  let tBigInt = gBBytes.subtract(kVBigInt).mod(pBigInt);
  if (tBigInt.isNegative()) {
    tBigInt = tBigInt.add(pBigInt);
  }
  const sABigInt = tBigInt.modPow(
    aBigInt.add(uBigInt.multiply(xBigInt)),
    pBigInt,
  );
  const sABytes = bigIntToBytes(sABigInt, 256);
  const kA = await H(sABytes);
  const M1 = await H(
    concatBytes(
      xorBytes(await H(p), await H(gBytes)),
      await H(salt1),
      await H(salt2),
      gABytes,
      gB,
      await kA,
    ),
  );

  return { A: gABytes, M1 };
}
