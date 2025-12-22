import React, { useState, useEffect } from 'react';
import { EncryptedPost, SecurityConfig, User, ViewState, PrivacyRiskAssessment } from './types';
import { SecureComposer } from './components/SecureComposer';
import { EncryptedFeed } from './components/EncryptedFeed';
import { SecuritySettings } from './components/SecuritySettings';
import { Shield, LayoutDashboard, Settings, UserCircle, LogOut } from 'lucide-react';

const MOCK_USER: User = {
  id: 'u-123',
  username: 'SecOp_Alpha',
  publicKey: {} as CryptoKey,
  publicKeyString: 'xxxx-xxxx'
};

const DEFAULT_CONFIG: SecurityConfig = {
  autoDecrypt: false,
  requireRiskScan: true,
  maskUsernames: false,
  theme: 'cyber'
};

const App: React.FC = () => {
  // State
  const [view, setView] = useState<ViewState>(ViewState.FEED);
  const [posts, setPosts] = useState<EncryptedPost[]>([]);
  const [config, setConfig] = useState<SecurityConfig>(DEFAULT_CONFIG);
  const [user] = useState<User>(MOCK_USER);

  // Load from persistence on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('vault_config');
    const savedPosts = localStorage.getItem('vault_posts');
    
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedPosts) setPosts(JSON.parse(savedPosts));
  }, []);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('vault_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('vault_posts', JSON.stringify(posts));
  }, [posts]);

  // Handler for new posts
  const handleNewPost = (content: string, assessment: PrivacyRiskAssessment) => {
    // "Encrypt" content (Base64 for simulation)
    const encryptedContent = btoa(content);
    
    const newPost: EncryptedPost = {
      id: crypto.randomUUID(),
      authorId: user.id,
      authorName: config.maskUsernames ? 'User-' + user.id.substring(0,4) : user.username,
      timestamp: Date.now(),
      payload: {
        ciphertext: encryptedContent,
        iv: 'simulated-iv',
        signature: 'simulated-sig',
        authorPubKeyString: user.publicKeyString
      },
      riskAssessment: assessment
    };

    setPosts([newPost, ...posts]);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-900">
          <div className="flex items-center gap-3 text-indigo-500">
            <Shield className="w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tight text-white">VaultConnect</h1>
          </div>
          <p className="text-xs text-slate-600 mt-2 font-mono">Ver: 0.9.1-Secure</p>
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
        </nav>

        <div className="p-4 border-t border-slate-900">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
            <UserCircle className="w-8 h-8" />
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium text-slate-200 truncate">{config.maskUsernames ? '****' : user.username}</div>
              <div className="text-xs text-slate-600 truncate">ID: {user.id}</div>
            </div>
            <LogOut className="w-4 h-4 cursor-pointer hover:text-white" />
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
            <button onClick={() => setView(ViewState.FEED)} className="p-2 text-slate-400"><LayoutDashboard className="w-5 h-5"/></button>
            <button onClick={() => setView(ViewState.SETTINGS)} className="p-2 text-slate-400"><Settings className="w-5 h-5"/></button>
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
                        {posts.length} records • E2EE Simulated
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

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;