import React, { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../src/firebase/auth';
import { Shield, Loader2, Mail, Lock, User } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

interface AuthScreenProps {
    onAuthSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
            onAuthSuccess();
        } catch (err: any) {
            setError(err.message || 'Google認証に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                await signUpWithEmail(email, password, displayName);
            } else {
                await signInWithEmail(email, password);
            }
            onAuthSuccess();
        } catch (err: any) {
            setError(err.message || '認証に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 text-indigo-500 mb-4">
                        <Shield className="w-12 h-12" />
                        <h1 className="text-3xl font-bold text-white">VaultConnect</h1>
                    </div>
                    <p className="text-slate-400">機密性の高いSNSプラットフォーム</p>
                </div>

                {/* Auth Card */}
                <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
                    <h2 className="text-xl font-semibold text-white mb-6 text-center">
                        {mode === 'signin' ? 'ログイン' : 'アカウント作成'}
                    </h2>

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-3 px-4 rounded-lg font-medium hover:bg-slate-100 transition-colors disabled:opacity-50 mb-6"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                                    <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z" />
                                    <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" />
                                    <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
                                </svg>
                                Googleでログイン
                            </>
                        )}
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-900 text-slate-500">または</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {mode === 'signup' && (
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="表示名"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    required
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                placeholder="メールアドレス"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                placeholder="パスワード"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                required
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                mode === 'signin' ? 'ログイン' : 'アカウント作成'
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <p className="text-center text-slate-400 mt-6">
                        {mode === 'signin' ? (
                            <>
                                アカウントをお持ちでない方は{' '}
                                <button
                                    onClick={() => setMode('signup')}
                                    className="text-indigo-400 hover:text-indigo-300"
                                >
                                    新規登録
                                </button>
                            </>
                        ) : (
                            <>
                                既にアカウントをお持ちの方は{' '}
                                <button
                                    onClick={() => setMode('signin')}
                                    className="text-indigo-400 hover:text-indigo-300"
                                >
                                    ログイン
                                </button>
                            </>
                        )}
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-sm mt-8">
                    Ver: 1.0.0-Firebase • E2EE対応
                </p>
            </div>
        </div>
    );
};
