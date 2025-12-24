export interface User {
  id: string;
  username: string;
  publicKey: CryptoKey; // Actual CryptoKey object
  publicKeyString: string; // Serialized for transport/UI
}

export interface EncryptedPayload {
  ciphertext: string; // Base64
  iv: string; // Base64
  signature: string; // Base64 (ECDSA signature of ciphertext + iv)
  authorPubKeyString: string; // To verify signature
}

export interface EncryptedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string | null;
  timestamp: number;
  payload: EncryptedPayload;
  riskAssessment?: PrivacyRiskAssessment;
}

export interface PrivacyRiskAssessment {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  warnings: string[];
  safeToPost: boolean;
  source: 'LOCAL' | 'AI';
}

export interface SecurityConfig {
  autoDecrypt: boolean;
  requireRiskScan: boolean;
  maskUsernames: boolean;
  theme: 'cyber' | 'minimal';
}

export interface KillSwitchConfig {
  kill_switch_active: boolean;
  min_client_version: string;
  message?: string;
}

export enum ViewState {
  FEED = 'FEED',
  SETTINGS = 'SETTINGS',
  FOLLOW = 'FOLLOW',
  COMMUNITY = 'COMMUNITY',
  THEME = 'THEME',
  AUDIT_LOG = 'AUDIT_LOG',
  LOCKDOWN = 'LOCKDOWN'
}
