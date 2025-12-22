import React, { useState } from 'react';
import { EncryptedPost } from '../types';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';

interface EncryptedFeedProps {
  posts: EncryptedPost[];
  autoDecrypt: boolean;
}

const PostItem: React.FC<{ post: EncryptedPost; autoDecrypt: boolean }> = ({ post, autoDecrypt }) => {
  const [decrypted, setDecrypted] = useState(autoDecrypt);
  
  // Simulation of decryption
  const content = atob(post.payload.ciphertext); 

  const handleToggle = () => setDecrypted(!decrypted);

  return (
    <div className="group relative bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
      
      {/* Risk Indicator Border */}
      {post.riskAssessment?.riskLevel === 'HIGH' && (
         <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-xl opacity-50" />
      )}
       {post.riskAssessment?.riskLevel === 'CRITICAL' && (
         <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-l-xl opacity-70" />
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400">
            {post.authorName.substring(0,2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-200">{post.authorName}</div>
            <div className="text-xs text-slate-500 font-mono">{new Date(post.timestamp).toLocaleString()}</div>
          </div>
        </div>
        <button 
          onClick={handleToggle}
          className="text-slate-500 hover:text-indigo-400 transition-colors"
          title={decrypted ? "Lock" : "Decrypt"}
        >
          {decrypted ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        </button>
      </div>

      <div className={`relative ${!decrypted ? 'font-mono text-xs break-all text-slate-600' : 'text-slate-300'}`}>
        {decrypted ? (
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : (
          <div className="p-3 bg-slate-950 rounded border border-slate-900 select-none cursor-pointer" onClick={() => setDecrypted(true)}>
             <span className="opacity-50">{post.payload.ciphertext.substring(0, 64)}...</span>
             <div className="flex items-center gap-2 mt-2 text-indigo-500 text-xs font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                Click to Decrypt
             </div>
          </div>
        )}
      </div>
      
      {decrypted && post.riskAssessment && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
            <ShieldAlert className="w-3 h-3" />
            <span>Audit: {post.riskAssessment.riskLevel} Risk</span>
        </div>
      )}
    </div>
  );
};

export const EncryptedFeed: React.FC<EncryptedFeedProps> = ({ posts, autoDecrypt }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-slate-600">
        <div className="inline-block p-4 rounded-full bg-slate-900 mb-4">
            <Lock className="w-8 h-8 opacity-50" />
        </div>
        <p>Secure feed is empty.</p>
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