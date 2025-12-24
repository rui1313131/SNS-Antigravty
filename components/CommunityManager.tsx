import React, { useState, useEffect } from 'react';
import { Users, Plus, Lock, Globe, LogIn, LogOut as LogOutIcon, Loader2 } from 'lucide-react';
import {
    Community,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    subscribeToPublicCommunities,
    subscribeToUserCommunities,
    isMemberOfCommunity
} from '../src/firebase/community';

interface CommunityManagerProps {
    uid: string;
    displayName: string;
}

export const CommunityManager: React.FC<CommunityManagerProps> = ({ uid, displayName }) => {
    const [publicCommunities, setPublicCommunities] = useState<Community[]>([]);
    const [myCommunities, setMyCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCommunity, setNewCommunity] = useState({ name: '', description: '', isPrivate: false });
    const [creating, setCreating] = useState(false);
    const [joiningId, setJoiningId] = useState<string | null>(null);

    // Subscribe to communities
    useEffect(() => {
        const unsubPublic = subscribeToPublicCommunities(setPublicCommunities);
        const unsubMy = subscribeToUserCommunities(uid, (communities) => {
            setMyCommunities(communities);
            setLoading(false);
        });

        return () => {
            unsubPublic();
            unsubMy();
        };
    }, [uid]);

    const handleCreate = async () => {
        if (!newCommunity.name.trim()) return;

        setCreating(true);
        try {
            await createCommunity({
                name: newCommunity.name.trim(),
                description: newCommunity.description.trim(),
                ownerId: uid,
                ownerName: displayName,
                isPrivate: newCommunity.isPrivate
            });
            setNewCommunity({ name: '', description: '', isPrivate: false });
            setShowCreateModal(false);
        } catch (error) {
            console.error('Failed to create community:', error);
        }
        setCreating(false);
    };

    const handleJoin = async (communityId: string) => {
        setJoiningId(communityId);
        try {
            await joinCommunity(communityId, uid);
        } catch (error) {
            console.error('Failed to join community:', error);
        }
        setJoiningId(null);
    };

    const handleLeave = async (communityId: string) => {
        setJoiningId(communityId);
        try {
            await leaveCommunity(communityId, uid);
        } catch (error) {
            console.error('Failed to leave community:', error);
        }
        setJoiningId(null);
    };

    const isMember = (communityId: string) => {
        return myCommunities.some(c => c.id === communityId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* My Communities */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" />
                        参加中のコミュニティ
                    </h3>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        新規作成
                    </button>
                </div>

                {myCommunities.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">まだコミュニティに参加していません</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {myCommunities.map((community) => (
                            <div
                                key={community.id}
                                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                                        {community.isPrivate ? (
                                            <Lock className="w-5 h-5 text-indigo-400" />
                                        ) : (
                                            <Globe className="w-5 h-5 text-green-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">{community.name}</div>
                                        <div className="text-xs text-slate-500">
                                            {community.memberCount}人のメンバー
                                        </div>
                                    </div>
                                </div>
                                {community.ownerId !== uid && (
                                    <button
                                        onClick={() => handleLeave(community.id)}
                                        disabled={joiningId === community.id}
                                        className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                                        title="退出"
                                    >
                                        {joiningId === community.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <LogOutIcon className="w-4 h-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Discover Communities */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-500" />
                    公開コミュニティ
                </h3>

                {publicCommunities.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">公開コミュニティはまだありません</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {publicCommunities.map((community) => (
                            <div
                                key={community.id}
                                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                            >
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">{community.name}</div>
                                    <div className="text-xs text-slate-500 mt-1">{community.description}</div>
                                    <div className="text-xs text-slate-600 mt-1">
                                        {community.memberCount}人 • 作成者: {community.ownerName}
                                    </div>
                                </div>
                                {!isMember(community.id) && (
                                    <button
                                        onClick={() => handleJoin(community.id)}
                                        disabled={joiningId === community.id}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 text-green-400 text-sm rounded-lg hover:bg-green-600/30 transition-colors"
                                    >
                                        {joiningId === community.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <LogIn className="w-4 h-4" />
                                                参加
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-white mb-4">新しいコミュニティを作成</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">コミュニティ名</label>
                                <input
                                    type="text"
                                    value={newCommunity.name}
                                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="例: プライバシー愛好会"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">説明</label>
                                <textarea
                                    value={newCommunity.description}
                                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
                                    rows={3}
                                    placeholder="コミュニティの説明..."
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    checked={newCommunity.isPrivate}
                                    onChange={(e) => setNewCommunity({ ...newCommunity, isPrivate: e.target.checked })}
                                    className="w-4 h-4 rounded bg-slate-800 border-slate-700"
                                />
                                <label htmlFor="isPrivate" className="text-sm text-slate-300">
                                    非公開コミュニティ（招待制）
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={creating || !newCommunity.name.trim()}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {creating ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                    '作成'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
