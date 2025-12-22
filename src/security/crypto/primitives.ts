import { EncryptedPayload } from '../../../types';
import { exportPublicKey, importPublicKey } from './keys';

// Helpers
function str2ab(str: string): ArrayBuffer {
  return new TextEncoder().encode(str);
}

function ab2str(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

function ab2base64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base642ab(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypts a post for a recipient (or self).
 * 1. Derives shared AES-GCM key using ECDH.
 * 2. Encrypts plaintext.
 * 3. Signs the ciphertext+IV with Author's Signing Key.
 */
export async function encryptPost(
  plaintext: string, 
  recipientPubKey: CryptoKey, // ECDH Public
  myEncryptionKey: CryptoKey, // ECDH Private
  mySigningKey: CryptoKey     // ECDSA Private
): Promise<EncryptedPayload> {
  
  // 1. Derive AES Key
  // Note: In a real P2P scenario, we might generate an Ephemeral Key here. 
  // For this slice, we assume static keys for simplicity or derived session keys.
  // Actually, standard practice: Generate random AES key, Encrypt content, Encrypt AES key with Recipient Public Key.
  // BUT Phase 13 vertical slice constraints: "Encrypt one post... Store... Decrypt".
  // Let's use ECDH to derive a shared key directly for this 1-to-1 simulation.
  
  const sharedBits = await window.crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: recipientPubKey,
    },
    myEncryptionKey,
    256
  );

  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    sharedBits,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );

  // 2. Encrypt
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = str2ab(plaintext);
  
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    encodedData
  );

  // 3. Sign (Ciphertext + IV)
  // We concatenate IV + Ciphertext to sign integrity of both.
  const payloadToSign = new Uint8Array(iv.byteLength + ciphertextBuffer.byteLength);
  payloadToSign.set(iv, 0);
  payloadToSign.set(new Uint8Array(ciphertextBuffer), iv.byteLength);

  const signatureBuffer = await window.crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" },
    },
    mySigningKey,
    payloadToSign
  );

  // Export my Signing Pub Key to include in payload (so others can verify)
  // In a real app, this comes from User Registry. Here we simulate.
  // Note: We can't export private keys, but we need the public counterpart. 
  // Assuming the caller handles public key distribution. 
  // For this payload, we will just placeholders or require the verification function to take the key.
  
  return {
    ciphertext: ab2base64(ciphertextBuffer),
    iv: ab2base64(iv.buffer),
    signature: ab2base64(signatureBuffer),
    authorPubKeyString: "" // Filled by caller/registry
  };
}

/**
 * Decrypts a post and VERIFIES signature.
 * Throws integrity error if verification fails.
 */
export async function decryptPost(
  payload: EncryptedPayload,
  myEncryptionKey: CryptoKey, // ECDH Private
  senderEncryptionPub: CryptoKey, // ECDH Public
  authorSigningPub: CryptoKey // ECDSA Public
): Promise<string> {

  const ciphertext = base642ab(payload.ciphertext);
  const iv = base642ab(payload.iv);
  const signature = base642ab(payload.signature);

  // 1. Verify Signature FIRST (Phase 12 Vector 1)
  const dataToVerify = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  dataToVerify.set(new Uint8Array(iv), 0);
  dataToVerify.set(new Uint8Array(ciphertext), iv.byteLength);

  const valid = await window.crypto.subtle.verify(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" },
    },
    authorSigningPub,
    signature,
    dataToVerify
  );

  if (!valid) {
    throw new Error("SECURITY_VIOLATION: Signature verification failed. Content may be tampered.");
  }

  // 2. Derive Key
  const sharedBits = await window.crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: senderEncryptionPub,
    },
    myEncryptionKey,
    256
  );

  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    sharedBits,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );

  // 3. Decrypt
  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv),
      },
      aesKey,
      ciphertext
    );
    return ab2str(decryptedBuffer);
  } catch (e) {
    throw new Error("DECRYPTION_FAILED: Key mismatch or data corruption.");
  }
}
