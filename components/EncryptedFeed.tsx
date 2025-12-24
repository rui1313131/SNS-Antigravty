import React, { useState } from 'react';
import { EncryptedPost } from '../types';
import { Lock, Unlock, ShieldAlert, Sparkles } from 'lucide-react';

interface EncryptedFeedProps {
  posts: EncryptedPost[];
  autoDecrypt: boolean;
}

const PostItem: React.FC<{ post: EncryptedPost; autoDecrypt: boolean }> = ({ post, autoDecrypt }) => {
  const [decrypted, setDecrypted] = useState(autoDecrypt);

  // Decode Base64 with UTF-8 support for Japanese text
  let content: string;
  try {
    content = decodeURIComponent(escape(atob(post.payload.ciphertext)));
  } catch {
    content = atob(post.payload.ciphertext);
  }

  const handleToggle = () => setDecrypted(!decrypted);

  // Get risk color
  const getRiskColor = () => {
    if (!post.riskAssessment) return null;
    switch (post.riskAssessment.riskLevel) {
      case 'CRITICAL': return 'from-red-500 to-red-600';
      case 'HIGH': return 'from-orange-500 to-amber-500';
      case 'MEDIUM': return 'from-yellow-500 to-orange-400';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  return (
    <div className="post-card group relative bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">

      {/* Gradient Risk Indicator */}
      {post.riskAssessment && (post.riskAssessment.riskLevel === 'HIGH' || post.riskAssessment.riskLevel === 'CRITICAL') && (
        <div className={`absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b ${getRiskColor()} rounded-full opacity-70`} />
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar with gradient ring on hover */}
          <div className="relative">
            {post.authorPhotoURL ? (
              <img
                src={post.authorPhotoURL}
                alt={post.authorName}
                className="avatar w-10 h-10 rounded-full object-cover ring-2 ring-slate-700 group-hover:ring-indigo-500/50 transition-all"
              />
            ) : (
              <div className="avatar w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm text-white shadow-lg">
                {post.authorName.substring(0, 2).toUpperCase()}
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
              {post.authorName}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {new Date(post.timestamp).toLocaleString('ja-JP', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Decrypt toggle button */}
        <button
          onClick={handleToggle}
          className={`p-2 rounded-lg transition-all duration-200 ${decrypted
              ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
              : 'bg-slate-800 text-slate-500 hover:text-indigo-400 hover:bg-slate-700'
            }`}
          title={decrypted ? "暗号化表示" : "復号化"}
        >
          {decrypted ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      <div className="relative">
        {decrypted ? (
          <p className="text-slate-200 whitespace-pre-wrap leading-relaxed text-[15px]">
            {content}
          </p>
        ) : (
          <div
            className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50 cursor-pointer hover:border-indigo-500/30 transition-all group/decrypt"
            onClick={() => setDecrypted(true)}
          >
            <div className="font-mono text-xs text-slate-600 break-all select-none">
              {post.payload.ciphertext.substring(0, 80)}...
            </div>
            <div className="flex items-center gap-2 mt-3 text-indigo-500 text-xs font-semibold uppercase tracking-wider group-hover/decrypt:text-indigo-400 transition-colors">
              <Sparkles className="w-3 h-3" />
              クリックして復号化
            </div>
          </div>
        )}
      </div>

      {/* Risk Assessment Badge */}
      {decrypted && post.riskAssessment && (
        <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>セキュリティ監査: </span>
            <span className={`font-semibold ${post.riskAssessment.riskLevel === 'CRITICAL' ? 'text-red-400' :
                post.riskAssessment.riskLevel === 'HIGH' ? 'text-orange-400' :
                  post.riskAssessment.riskLevel === 'MEDIUM' ? 'text-yellow-400' :
                    'text-green-400'
              }`}>
              {post.riskAssessment.riskLevel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const EncryptedFeed: React.FC<EncryptedFeedProps> = ({ posts, autoDecrypt }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 mb-6 shadow-xl">
          <Lock className="w-12 h-12 text-slate-600" />
        </div>
        <p className="text-slate-500 text-lg font-medium">セキュアフィードは空です</p>
        <p className="text-slate-600 text-sm mt-2">最初の投稿を作成しましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostItem key={post.id} post={post} autoDecrypt={autoDecrypt} />
      ))}
    </div>
  );
};