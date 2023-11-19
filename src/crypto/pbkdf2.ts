import crypto from 'node:crypto';

export async function PBKDF2(password: string, salt: string, iterations: number) {
  return crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
}
