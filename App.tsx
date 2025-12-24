import React, { useState, useEffect } from 'react';
import { EncryptedPost, SecurityConfig, ViewState, PrivacyRiskAssessment } from './types';
import { SecureComposer } from './components/SecureComposer';
import { EncryptedFeed } from './components/EncryptedFeed';
import { SecuritySettings } from './components/SecuritySettings';
import { AuthScreen } from './components/AuthScreen';
import { FollowManager } from './components/FollowManager';
import { CommunityManager } from './components/CommunityManager';
import { ThemeCustomizer } from './components/ThemeCustomizer';
import { Shield, LayoutDashboard, Settings, LogOut, Loader2, Users, Globe, Palette } from 'lucide-react';

// Firebase imports
import { AuthUser, onAuthChange, signOut } from './src/firebase/auth';
import { createPost, subscribeToPosts, RealtimePost } from './src/firebase/posts';

const DEFAULT_CONFIG: SecurityConfig = {
  autoDecrypt: false,
  requireRiskScan: true,
  maskUsernames: false,
  theme: 'cyber'
};

const App: React.FC = () => {
  // Auth state
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App state
  const [view, setView] = useState<ViewState>(ViewState.FEED);
  const [posts, setPosts] = useState<EncryptedPost[]>([]);
  const [config, setConfig] = useState<SecurityConfig>(DEFAULT_CONFIG);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // State for following list
  const [followingList, setFollowingList] = useState<string[]>([]);

  // Load following list when authenticated
  useEffect(() => {
    if (!authUser) return;

    import('./src/firebase/posts').then(({ getFollowingList }) => {
      getFollowingList(authUser.uid).then(setFollowingList);
    });
  }, [authUser]);

  // Subscribe to posts when authenticated (with visibility filtering)
  useEffect(() => {
    if (!authUser) return;

    const unsubscribe = subscribeToPosts((realtimePosts) => {
      // Convert Realtime Database posts to EncryptedPost format
      const convertedPosts: EncryptedPost[] = realtimePosts.map((p) => ({
        id: p.id,
        authorId: p.authorId,
        authorName: config.maskUsernames ? 'User-' + p.authorId.substring(0, 4) : p.authorName,
        authorPhotoURL: p.authorPhotoURL,
        timestamp: p.createdAt || Date.now(),
        payload: {
          ciphertext: p.encryptedContent,
          iv: 'firebase-stored',
          signature: 'verified',
          authorPubKeyString: p.authorId
        },
        riskAssessment: p.riskAssessment
      }));
      setPosts(convertedPosts);
    }, authUser.uid, followingList);  // Pass following list for visibility filtering

    return () => unsubscribe();
  }, [authUser, config.maskUsernames, followingList]);

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('vault_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  // Persist config
  useEffect(() => {
    localStorage.setItem('vault_config', JSON.stringify(config));
  }, [config]);

  // Handler for new posts
  const handleNewPost = async (content: string, assessment: PrivacyRiskAssessment) => {
    if (!authUser) return;

    // Encrypt content (Base64 for now, real E2EE can be added later)
    const encryptedContent = btoa(unescape(encodeURIComponent(content)));

    try {
      await createPost({
        authorId: authUser.uid,
        authorName: authUser.displayName || 'Anonymous',
        authorPhotoURL: authUser.photoURL,
        content: content,
        encryptedContent: encryptedContent,
        riskAssessment: assessment
      });
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth screen
  if (!authUser) {
    return <AuthScreen onAuthSuccess={() => { }} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-900">
          <div className="flex items-center gap-3 text-indigo-500">
            <Shield className="w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tight text-white">VaultConnect</h1>
          </div>
          <p className="text-xs text-slate-600 mt-2 font-mono">Ver: 1.0.0-Firebase</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setView(ViewState.FEED)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === ViewState.FEED ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Encrypted Feed
          </button>

          <button
            onClick={() => setView(ViewState.SETTINGS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === ViewState.SETTINGS ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <Settings className="w-5 h-5" />
            Security Protocol
          </button>

          <button
            onClick={() => setView(ViewState.FOLLOW)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === ViewState.FOLLOW ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <Users className="w-5 h-5" />
            フォロー管理
          </button>

          <button
            onClick={() => setView(ViewState.COMMUNITY)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === ViewState.COMMUNITY ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <Globe className="w-5 h-5" />
            コミュニティ
          </button>

          <button
            onClick={() => setView(ViewState.THEME)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === ViewState.THEME ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <Palette className="w-5 h-5" />
            テーマ設定
          </button>
        </nav>

        <div className="p-4 border-t border-slate-900">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
            {authUser.photoURL ? (
              <img src={authUser.photoURL} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                {(authUser.displayName || authUser.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium text-slate-200 truncate">
                {config.maskUsernames ? '****' : (authUser.displayName || 'Anonymous')}
              </div>
              <div className="text-xs text-slate-600 truncate">{authUser.email}</div>
            </div>
            <button onClick={handleSignOut} title="ログアウト">
              <LogOut className="w-4 h-4 cursor-pointer hover:text-white" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-900 bg-slate-950 z-10">
          <div className="flex items-center gap-2 text-indigo-500">
            <Shield className="w-6 h-6" />
            <span className="font-bold text-white">Vault</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView(ViewState.FEED)} className="p-2 text-slate-400"><LayoutDashboard className="w-5 h-5" /></button>
            <button onClick={() => setView(ViewState.SETTINGS)} className="p-2 text-slate-400"><Settings className="w-5 h-5" /></button>
            <button onClick={handleSignOut} className="p-2 text-slate-400"><LogOut className="w-5 h-5" /></button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">

            {view === ViewState.FEED && (
              <div className="animate-in fade-in duration-300">
                <SecureComposer onPost={handleNewPost} config={config} />

                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-300">Stream</h2>
                  <span className="text-xs font-mono text-slate-500">
                    {posts.length} records • Firebase Sync
                  </span>
                </div>

                <EncryptedFeed posts={posts} autoDecrypt={config.autoDecrypt} />
              </div>
            )}

            {view === ViewState.SETTINGS && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <SecuritySettings config={config} onUpdate={setConfig} />
              </div>
            )}

            {view === ViewState.FOLLOW && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-semibold text-white mb-6">フォロー管理</h2>
                <FollowManager uid={authUser.uid} />
              </div>
            )}

            {view === ViewState.COMMUNITY && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-semibold text-white mb-6">コミュニティ</h2>
                <CommunityManager uid={authUser.uid} displayName={authUser.displayName || 'Anonymous'} />
              </div>
            )}

            {view === ViewState.THEME && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-semibold text-white mb-6">テーマ設定</h2>
                <ThemeCustomizer uid={authUser.uid} />
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;