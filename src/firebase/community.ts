// Community service - Realtime Database operations for communities
import {
    ref,
    push,
    set,
    get,
    remove,
    onValue,
    update
} from 'firebase/database';
import { database } from './config';

export type Community = {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    ownerName: string;
    isPrivate: boolean;
    memberCount: number;
    createdAt: number;
};

export type NewCommunity = {
    name: string;
    description: string;
    ownerId: string;
    ownerName: string;
    isPrivate: boolean;
};

// Create a new community
export const createCommunity = async (community: NewCommunity): Promise<string> => {
    const communitiesRef = ref(database, 'communities');
    const newCommunityRef = push(communitiesRef);
    const communityId = newCommunityRef.key || '';

    await set(newCommunityRef, {
        ...community,
        memberCount: 1,
        createdAt: Date.now()
    });

    // Add owner as a member
    const memberRef = ref(database, `communityMembers/${communityId}/${community.ownerId}`);
    await set(memberRef, {
        role: 'owner',
        joinedAt: Date.now()
    });

    // Add to user's communities
    const userCommunityRef = ref(database, `userCommunities/${community.ownerId}/${communityId}`);
    await set(userCommunityRef, true);

    return communityId;
};

// Join a community
export const joinCommunity = async (communityId: string, userId: string): Promise<void> => {
    // Add user to community members
    const memberRef = ref(database, `communityMembers/${communityId}/${userId}`);
    await set(memberRef, {
        role: 'member',
        joinedAt: Date.now()
    });

    // Add to user's communities
    const userCommunityRef = ref(database, `userCommunities/${userId}/${communityId}`);
    await set(userCommunityRef, true);

    // Increment member count
    const communityRef = ref(database, `communities/${communityId}`);
    const snapshot = await get(communityRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        await update(communityRef, { memberCount: (data.memberCount || 0) + 1 });
    }
};

// Leave a community
export const leaveCommunity = async (communityId: string, userId: string): Promise<void> => {
    // Remove user from community members
    const memberRef = ref(database, `communityMembers/${communityId}/${userId}`);
    await remove(memberRef);

    // Remove from user's communities
    const userCommunityRef = ref(database, `userCommunities/${userId}/${communityId}`);
    await remove(userCommunityRef);

    // Decrement member count
    const communityRef = ref(database, `communities/${communityId}`);
    const snapshot = await get(communityRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        await update(communityRef, { memberCount: Math.max(0, (data.memberCount || 0) - 1) });
    }
};

// Check if user is a member of a community
export const isMemberOfCommunity = async (communityId: string, userId: string): Promise<boolean> => {
    const memberRef = ref(database, `communityMembers/${communityId}/${userId}`);
    const snapshot = await get(memberRef);
    return snapshot.exists();
};

// Get user's communities
export const getUserCommunities = async (userId: string): Promise<string[]> => {
    const userCommunitiesRef = ref(database, `userCommunities/${userId}`);
    const snapshot = await get(userCommunitiesRef);
    if (snapshot.exists()) {
        return Object.keys(snapshot.val());
    }
    return [];
};

// Subscribe to all public communities
export const subscribeToPublicCommunities = (
    callback: (communities: Community[]) => void
): (() => void) => {
    const communitiesRef = ref(database, 'communities');

    return onValue(communitiesRef, (snapshot) => {
        const communities: Community[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const data = child.val();
                if (!data.isPrivate) {
                    communities.push({
                        id: child.key || '',
                        ...data
                    });
                }
            });
        }
        // Sort by member count
        communities.sort((a, b) => b.memberCount - a.memberCount);
        callback(communities);
    });
};

// Subscribe to user's communities
export const subscribeToUserCommunities = (
    userId: string,
    callback: (communities: Community[]) => void
): (() => void) => {
    const userCommunitiesRef = ref(database, `userCommunities/${userId}`);

    return onValue(userCommunitiesRef, async (snapshot) => {
        const communities: Community[] = [];
        if (snapshot.exists()) {
            const communityIds = Object.keys(snapshot.val());
            for (const id of communityIds) {
                const communityRef = ref(database, `communities/${id}`);
                const communitySnapshot = await get(communityRef);
                if (communitySnapshot.exists()) {
                    communities.push({
                        id,
                        ...communitySnapshot.val()
                    });
                }
            }
        }
        callback(communities);
    });
};

// Get community by ID
export const getCommunity = async (communityId: string): Promise<Community | null> => {
    const communityRef = ref(database, `communities/${communityId}`);
    const snapshot = await get(communityRef);
    if (snapshot.exists()) {
        return {
            id: communityId,
            ...snapshot.val()
        };
    }
    return null;
};
