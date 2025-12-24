import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Users, Lock, Unlock, Bell } from 'lucide-react';
import {
    FollowRequest,
    subscribeToFollowRequests,
    acceptFollowRequest,
    rejectFollowRequest,
    subscribeToFollowersCount,
    subscribeToFollowingCount,
    getUserProfile,
    updateUserProfile
} from '../src/firebase/follow';

interface FollowManagerProps {
    uid: string;
}

export const FollowManager: React.FC<FollowManagerProps> = ({ uid }) => {
    const [requests, setRequests] = useState<FollowRequest[]>([]);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(true);

    // Subscribe to follow requests
    useEffect(() => {
        const unsubRequests = subscribeToFollowRequests(uid, setRequests);
        const unsubFollowers = subscribeToFollowersCount(uid, setFollowersCount);
        const unsubFollowing = subscribeToFollowingCount(uid, setFollowingCount);

        // Get initial profile
        getUserProfile(uid).then(profile => {
            if (profile) {
                setIsPublic(profile.isPublic);
            }
            setLoading(false);
        });

        return () => {
            unsubRequests();
            unsubFollowers();
            unsubFollowing();
        };
    }, [uid]);

    const handleAccept = async (requesterUid: string) => {
        try {
            await acceptFollowRequest(uid, requesterUid);
        } catch (error) {
            console.error('Failed to accept request:', error);
        }
    };

    const handleReject = async (requesterUid: string) => {
        try {
            await rejectFollowRequest(uid, requesterUid);
        } catch (error) {
            console.error('Failed to reject request:', error);
        }
    };

    const toggleVisibility = async () => {
        try {
            const newValue = !isPublic;
            await updateUserProfile(uid, { isPublic: newValue });
            setIsPublic(newValue);
        } catch (error) {
            console.error('Failed to update visibility:', error);
        }
    };

    if (loading) {
        return <div className="text-slate-500">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Account Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    アカウント設定
                </h3>

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-slate-800">
                    <div>
                        <div className="text-sm font-medium text-slate-200">アカウントの公開設定</div>
                        <div className="text-xs text-slate-500 mt-1">
                            {isPublic ? '誰でも投稿を見れます' : '承認したフォロワーのみ投稿を見れます'}
                        </div>
                    </div>
                    <button
                        onClick={toggleVisibility}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isPublic
                                ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                : 'bg-orange-600/20 text-orange-400 hover:bg-orange-600/30'
                            }`}
                    >
                        {isPublic ? (
                            <>
                                <Unlock className="w-4 h-4" />
                                公開
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                非公開
                            </>
                        )}
                    </button>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{followersCount}</div>
                        <div className="text-xs text-slate-500">フォロワー</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{followingCount}</div>
                        <div className="text-xs text-slate-500">フォロー中</div>
                    </div>
                </div>
            </div>

            {/* Pending Requests */}
            {requests.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-orange-500" />
                        フォローリクエスト
                        <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {requests.length}
                        </span>
                    </h3>

                    <div className="space-y-3">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    {request.fromPhotoURL ? (
                                        <img
                                            src={request.fromPhotoURL}
                                            alt=""
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                                            {request.fromName[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm font-medium text-white">{request.fromName}</div>
                                        <div className="text-xs text-slate-500">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(request.fromUid)}
                                        className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                                        title="承認"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.fromUid)}
                                        className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                                        title="拒否"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {requests.length === 0 && !isPublic && (
                <div className="text-center py-8 text-slate-600">
                    <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">フォローリクエストはありません</p>
                </div>
            )}
        </div>
    );
};
