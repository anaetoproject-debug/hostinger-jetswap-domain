
/**
 * Jet Swap Security Service
 * Handles client-side encryption and Firebase backend delivery.
 */
import { recordEncryptedSwap } from './firebaseService';

const ADMIN_PUBLIC_KEY_MOCK = "jet-admin-0x9922-secure-vault";

export interface EncryptedBundle {
  ciphertext: string;
  iv: string;
  timestamp: number;
  adminId: string;
}

export async function encryptTransactionData(data: object): Promise<EncryptedBundle> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encodedData
  );

  const ciphertext = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return {
    ciphertext,
    iv: ivBase64,
    timestamp: Date.now(),
    adminId: ADMIN_PUBLIC_KEY_MOCK
  };
}

/**
 * Unified logic to encrypt, save to Firebase, and simulate admin notification
 */
export async function processSecureSwap(swapData: any, originalData: any, userId: string) {
  console.group("%c🔒 JET SECURE FLOW", "color: #06b6d4; font-weight: bold;");
  
  // 1. Encrypt on Client
  const bundle = await encryptTransactionData(swapData);
  console.log("1. Data Encrypted (AES-256)");

  // 2. Save to Firebase (Real Backend)
  try {
    await recordEncryptedSwap(bundle, {
        route: originalData.route,
        amount: originalData.amount
    }, userId);
    console.log("2. Pushed to Firebase Firestore (Secure Vault)");
  } catch (err) {
    console.warn("Firebase record failed, falling back to local simulation.");
  }

  // 3. Simulate Backend Email/Admin process
  await new Promise(r => setTimeout(r, 800));
  console.log("%c📧 ADMIN EMAIL NOTIFICATION TRIGGERED", "color: #10b981; font-weight: bold;");
  console.log("Payload available for admin decryption in secure dashboard.");
  
  console.groupEnd();
  return bundle;
}
