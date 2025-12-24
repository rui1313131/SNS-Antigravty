// Firebase configuration for VaultConnect
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAG1FRQpgeiRwWuPtjnhlmPiLE74YkSrSU",
    authDomain: "vaultconnect-594c9.firebaseapp.com",
    databaseURL: "https://vaultconnect-594c9-default-rtdb.firebaseio.com",
    projectId: "vaultconnect-594c9",
    storageBucket: "vaultconnect-594c9.firebasestorage.app",
    messagingSenderId: "138344207894",
    appId: "1:138344207894:web:8ddf74c0cdefa97f4d0737"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Realtime Database
export const database = getDatabase(app);

export default app;
