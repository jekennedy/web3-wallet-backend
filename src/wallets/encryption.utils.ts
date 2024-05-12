import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export function encryptPrivateKey(privateKey: string, key: string): string {
  if (!key) {
    throw new Error('Encryption key is required');
  }
  if (Buffer.from(key, 'hex').length !== 32) {
    throw new Error(
      'Invalid key length: Key must be 256 bits (64 hex characters)',
    );
  }

  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
  encryptedPrivateKey += cipher.final('hex');
  return iv.toString('hex') + encryptedPrivateKey;
}

export function decryptPrivateKey(privateKey: string, key: string): string {
  if (!key) {
    throw new Error('Encryption key is not configured');
  }
  if (Buffer.from(key, 'hex').length !== 32) {
    throw new Error(
      'Invalid key length: Key must be 256 bits (64 hex characters)',
    );
  }

  const iv = Buffer.from(privateKey.slice(0, 32), 'hex');
  const encryptedData = privateKey.slice(32);

  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decryptedPrivateKey = decipher.update(encryptedData, 'hex', 'utf8');
  try {
    decryptedPrivateKey += decipher.final('utf8');
  } catch (error) {
    throw new Error('Decryption failed: ' + error.message);
  }
  return decryptedPrivateKey;
}
