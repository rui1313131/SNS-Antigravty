const DB_NAME = 'VaultKeyStore';
const DB_VERSION = 1;
const STORE_NAME = 'keys';

export interface VaultKeys {
  signingPair: CryptoKeyPair;
  encryptionPair: CryptoKeyPair;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function generateIdentityKeys(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    false, // Private key non-exportable
    ["sign", "verify"]
  );
}

async function generateEncryptionKeys(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    false, // Private key non-exportable
    ["deriveKey", "deriveBits"]
  );
}

export async function loadKeys(): Promise<VaultKeys> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    const signReq = store.get("signingPair");
    const encReq = store.get("encryptionPair");

    transaction.oncomplete = async () => {
      let signingPair = signReq.result;
      let encryptionPair = encReq.result;

      if (!signingPair || !encryptionPair) {
        console.log("Generating new Vault Keys...");
        signingPair = await generateIdentityKeys();
        encryptionPair = await generateEncryptionKeys();
        
        // Save them
        const saveTx = db.transaction([STORE_NAME], "readwrite");
        const saveStore = saveTx.objectStore(STORE_NAME);
        saveStore.put(signingPair, "signingPair");
        saveStore.put(encryptionPair, "encryptionPair");
        
        await new Promise<void>((res) => { saveTx.oncomplete = () => res(); });
      }
      
      resolve({ signingPair, encryptionPair });
    };

    transaction.onerror = () => reject(transaction.error);
  });
}

export async function wipeKeys(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("spki", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function importPublicKey(pem: string, algo: "ECDSA" | "ECDH"): Promise<CryptoKey> {
  const binaryDerString = atob(pem);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  return window.crypto.subtle.importKey(
    "spki",
    binaryDer.buffer,
    algo === "ECDSA" ? { name: "ECDSA", namedCurve: "P-256" } : { name: "ECDH", namedCurve: "P-256" },
    true,
    algo === "ECDSA" ? ["verify"] : [] // ECDH public keys are for deriving bits usually, but sometimes import implies usage
  );
}
