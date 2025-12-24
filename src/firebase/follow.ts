// Follow system service - Realtime Database operations for follow relationships
import {
    ref,
    set,
    get,
    push,
    remove,
    onValue,
    update
} from 'firebase/database';
import { database } from './config';

export type UserProfile = {
    uid: string;
    email: string | null;
    displayName: string;
    photoURL: string | null;
    isPublic: boolean;
    bio?: string;
    createdAt: number;
    updatedAt: number;
};

export type FollowRequest = {
    id: string;
    fromUid: string;
    fromName: string;
    fromPhotoURL: string | null;
    createdAt: number;
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        return snapshot.val() as UserProfile;
    }
    return null;
};

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
    const userRef = ref(database, `users/${uid}`);
    await update(userRef, {
        ...updates,
        updatedAt: Date.now()
    });
};

// Set account visibility (public/private)
export const setAccountVisibility = async (uid: string, isPublic: boolean): Promise<void> => {
    await updateUserProfile(uid, { isPublic });
};

// Send follow request
export const sendFollowRequest = async (
    fromUid: string,
    fromName: string,
    fromPhotoURL: string | null,
    toUid: string
): Promise<void> => {
    // Check if target user is public
    const targetProfile = await getUserProfile(toUid);

    if (targetProfile?.isPublic) {
        // If public, directly add to followers
        await addFollower(fromUid, toUid);
    } else {
        // If private, create a pending request
        const requestRef = ref(database, `followRequests/${toUid}/${fromUid}`);
        await set(requestRef, {
            fromUid,
            fromName,
            fromPhotoURL,
            createdAt: Date.now()
        });
    }
};

// Accept follow request
export const acceptFollowRequest = async (currentUid: string, requesterUid: string): Promise<void> => {
    // Add to followers
    await addFollower(requesterUid, currentUid);

    // Remove the request
    const requestRef = ref(database, `followRequests/${currentUid}/${requesterUid}`);
    await remove(requestRef);
};

// Reject follow request
export const rejectFollowRequest = async (currentUid: string, requesterUid: string): Promise<void> => {
    const requestRef = ref(database, `followRequests/${currentUid}/${requesterUid}`);
    await remove(requestRef);
};

// Add follower (internal function)
const addFollower = async (followerUid: string, followedUid: string): Promise<void> => {
    // Add to followed user's followers list
    const followerRef = ref(database, `followers/${followedUid}/${followerUid}`);
    await set(followerRef, true);

    // Add to follower's following list
    const followingRef = ref(database, `following/${followerUid}/${followedUid}`);
    await set(followingRef, true);
};

// Unfollow user
export const unfollowUser = async (currentUid: string, targetUid: string): Promise<void> => {
    // Remove from target's followers
    const followerRef = ref(database, `followers/${targetUid}/${currentUid}`);
    await remove(followerRef);

    // Remove from current user's following
    const followingRef = ref(database, `following/${currentUid}/${targetUid}`);
    await remove(followingRef);
};

// Check if following
export const isFollowing = async (currentUid: string, targetUid: string): Promise<boolean> => {
    const followingRef = ref(database, `following/${currentUid}/${targetUid}`);
    const snapshot = await get(followingRef);
    return snapshot.exists();
};

// Get followers list
export const getFollowers = async (uid: string): Promise<string[]> => {
    const followersRef = ref(database, `followers/${uid}`);
    const snapshot = await get(followersRef);
    if (snapshot.exists()) {
        return Object.keys(snapshot.val());
    }
    return [];
};

// Get following list
export const getFollowing = async (uid: string): Promise<string[]> => {
    const followingRef = ref(database, `following/${uid}`);
    const snapshot = await get(followingRef);
    if (snapshot.exists()) {
        return Object.keys(snapshot.val());
    }
    return [];
};

// Subscribe to pending follow requests
export const subscribeToFollowRequests = (
    uid: string,
    callback: (requests: FollowRequest[]) => void
): (() => void) => {
    const requestsRef = ref(database, `followRequests/${uid}`);

    return onValue(requestsRef, (snapshot) => {
        const requests: FollowRequest[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                requests.push({
                    id: child.key || '',
                    ...child.val()
                });
            });
        }
        callback(requests);
    });
};

// Subscribe to followers count
export const subscribeToFollowersCount = (
    uid: string,
    callback: (count: number) => void
): (() => void) => {
    const followersRef = ref(database, `followers/${uid}`);

    return onValue(followersRef, (snapshot) => {
        callback(snapshot.exists() ? Object.keys(snapshot.val()).length : 0);
    });
};

// Subscribe to following count
export const subscribeToFollowingCount = (
    uid: string,
    callback: (count: number) => void
): (() => void) => {
    const followingRef = ref(database, `following/${uid}`);

    return onValue(followingRef, (snapshot) => {
        callback(snapshot.exists() ? Object.keys(snapshot.val()).length : 0);
    });
};
