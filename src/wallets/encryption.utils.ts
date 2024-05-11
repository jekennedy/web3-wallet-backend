import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export function encryptPrivateKey(privateKey: string, key: string): string {
  if (!key) {
    throw new Error('Encryption key is required');
  }

  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
  encryptedPrivateKey += cipher.final('hex');
  return iv.toString('hex') + encryptedPrivateKey;
}

export function decryptPrivateKey(
  encryptedPrivateKey: string,
  key: string,
): string {
  if (!key) {
    throw new Error('Encryption key is not configured');
  }

  // Extract initialization vector (first 16 characters) from the encrypted private key
  const iv = Buffer.from(encryptedPrivateKey.slice(0, 32), 'hex');
  // Extract the actual encrypted private key (remaining characters)
  const encryptedData = encryptedPrivateKey.slice(32);

  // Create a decipher object with the same algorithm and key
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  // Decrypt the encrypted private key
  let decryptedPrivateKey = decipher.update(encryptedData, 'hex', 'utf8');
  decryptedPrivateKey += decipher.final('utf8');
  return decryptedPrivateKey;
}
