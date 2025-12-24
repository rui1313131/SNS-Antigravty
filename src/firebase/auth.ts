// Authentication service
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { ref, set, get, serverTimestamp } from 'firebase/database';
import { auth, googleProvider, database } from './config';

export type AuthUser = {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<AuthUser> => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Create/update user document in Realtime Database
    await createUserProfile(user);

    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
    };
};

// Sign in with email/password
export const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
    };
};

// Sign up with email/password
export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<AuthUser> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Create user profile
    await createUserProfile(user, displayName);

    return {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: null
    };
};

// Sign out
export const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
};

// Create user profile in Realtime Database
const createUserProfile = async (user: User, displayName?: string): Promise<void> => {
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
        await set(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: displayName || user.displayName || 'Anonymous',
            photoURL: user.photoURL,
            isPublic: false,  // Default to private account
            bio: '',
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    } else {
        await set(ref(database, `users/${user.uid}/updatedAt`), Date.now());
    }
};

// Auth state listener
export const onAuthChange = (callback: (user: AuthUser | null) => void): (() => void) => {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            callback({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            });
        } else {
            callback(null);
        }
    });
};
