// Posts service - Realtime Database operations for posts
import {
    ref,
    push,
    onValue,
    query,
    orderByChild,
    limitToLast,
    get
} from 'firebase/database';
import { database } from './config';
import { PrivacyRiskAssessment } from '../../types';

export type RealtimePost = {
    id: string;
    authorId: string;
    authorName: string;
    authorPhotoURL: string | null;
    content: string;
    encryptedContent: string;
    riskAssessment: PrivacyRiskAssessment;
    createdAt: number;
    communityId?: string;
};

export type NewPost = {
    authorId: string;
    authorName: string;
    authorPhotoURL: string | null;
    content: string;
    encryptedContent: string;
    riskAssessment: PrivacyRiskAssessment;
    communityId?: string;
};

// Create a new post
export const createPost = async (post: NewPost): Promise<string> => {
    const postsRef = ref(database, 'posts');

    const newPostRef = await push(postsRef, {
        ...post,
        createdAt: Date.now()
    });

    return newPostRef.key || '';
};

// Subscribe to posts with visibility filtering
export const subscribeToPosts = (
    callback: (posts: RealtimePost[]) => void,
    currentUserId: string,
    followingList: string[] = [],
    maxPosts: number = 50
): (() => void) => {
    const postsRef = ref(database, 'posts');
    const postsQuery = query(postsRef, orderByChild('createdAt'), limitToLast(maxPosts));

    // Create a set for O(1) lookup
    const followingSet = new Set(followingList);

    // Cache for public status
    const publicCache = new Map<string, boolean>();

    const unsubscribe = onValue(postsQuery, async (snapshot) => {
        const allPosts: RealtimePost[] = [];

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            allPosts.push({
                id: childSnapshot.key || '',
                ...data
            });
        });

        // Reverse to show newest first
        allPosts.reverse();

        // Filter posts synchronously using cached data
        const visiblePosts: RealtimePost[] = [];

        for (const post of allPosts) {
            // 1. Own posts - always visible
            if (post.authorId === currentUserId) {
                visiblePosts.push(post);
                continue;
            }

            // 2. Following - always visible
            if (followingSet.has(post.authorId)) {
                visiblePosts.push(post);
                continue;
            }

            // 3. Check if author's account is public
            let isPublic = publicCache.get(post.authorId);

            if (isPublic === undefined) {
                // Fetch and cache
                try {
                    const userRef = ref(database, `users/${post.authorId}/isPublic`);
                    const snap = await get(userRef);
                    isPublic = snap.exists() ? snap.val() : true; // default to public
                    publicCache.set(post.authorId, isPublic);
                } catch {
                    isPublic = true; // on error, default to public
                }
            }

            if (isPublic) {
                visiblePosts.push(post);
            }
        }

        callback(visiblePosts);
    });

    return unsubscribe;
};

// Get following list for a user
export const getFollowingList = async (uid: string): Promise<string[]> => {
    const followingRef = ref(database, `following/${uid}`);
    const snapshot = await get(followingRef);
    if (snapshot.exists()) {
        return Object.keys(snapshot.val());
    }
    return [];
};
