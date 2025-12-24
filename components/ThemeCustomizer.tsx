import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Monitor, Type, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import {
    UserSettings,
    ThemeMode,
    FontSize,
    ACCENT_COLORS,
    DEFAULT_SETTINGS,
    subscribeToUserSettings,
    saveUserSettings,
    applyTheme
} from '../src/firebase/settings';

interface ThemeCustomizerProps {
    uid: string;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ uid }) => {
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Subscribe to settings
    useEffect(() => {
        const unsubscribe = subscribeToUserSettings(uid, (newSettings) => {
            setSettings(newSettings);
            applyTheme(newSettings);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [uid]);

    const updateSetting = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        setSaving(true);
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        applyTheme(newSettings);

        try {
            await saveUserSettings(uid, { [key]: value });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
        setSaving(false);
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
            {/* Theme Mode */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-500" />
                    テーマ設定
                    {saving && <Loader2 className="w-4 h-4 animate-spin text-slate-500 ml-2" />}
                </h3>

                {/* Theme Mode Selector */}
                <div className="mb-6">
                    <label className="block text-sm text-slate-400 mb-3">外観モード</label>
                    <div className="flex gap-2">
                        {[
                            { mode: 'dark' as ThemeMode, icon: Moon, label: 'ダーク' },
                            { mode: 'light' as ThemeMode, icon: Sun, label: 'ライト' },
                            { mode: 'auto' as ThemeMode, icon: Monitor, label: '自動' }
                        ].map(({ mode, icon: Icon, label }) => (
                            <button
                                key={mode}
                                onClick={() => updateSetting('theme', mode)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${settings.theme === mode
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accent Color */}
                <div className="mb-6">
                    <label className="block text-sm text-slate-400 mb-3">アクセントカラー</label>
                    <div className="flex flex-wrap gap-2">
                        {ACCENT_COLORS.map(({ name, value }) => (
                            <button
                                key={value}
                                onClick={() => updateSetting('accentColor', value)}
                                className={`w-10 h-10 rounded-lg transition-transform hover:scale-110 ${settings.accentColor === value
                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                                        : ''
                                    }`}
                                style={{ backgroundColor: value }}
                                title={name}
                            />
                        ))}
                    </div>
                </div>

                {/* Font Size */}
                <div className="mb-6">
                    <label className="block text-sm text-slate-400 mb-3">
                        <Type className="w-4 h-4 inline mr-1" />
                        フォントサイズ
                    </label>
                    <div className="flex gap-2">
                        {[
                            { size: 'small' as FontSize, label: '小' },
                            { size: 'medium' as FontSize, label: '中' },
                            { size: 'large' as FontSize, label: '大' }
                        ].map(({ size, label }) => (
                            <button
                                key={size}
                                onClick={() => updateSetting('fontSize', size)}
                                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${settings.fontSize === size
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <span className={`text-${size === 'small' ? 'xs' : size === 'large' ? 'lg' : 'sm'}`}>
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Compact Mode */}
                <div className="flex items-center justify-between py-3 border-t border-slate-800">
                    <div>
                        <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                            {settings.compactMode ? (
                                <Minimize2 className="w-4 h-4" />
                            ) : (
                                <Maximize2 className="w-4 h-4" />
                            )}
                            コンパクトモード
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            投稿の間隔を狭くして、より多くの投稿を表示
                        </div>
                    </div>
                    <button
                        onClick={() => updateSetting('compactMode', !settings.compactMode)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${settings.compactMode ? 'bg-indigo-600' : 'bg-slate-700'
                            }`}
                    >
                        <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.compactMode ? 'translate-x-7' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-400 mb-3">プレビュー</h3>
                <div
                    className="p-4 rounded-lg border border-slate-700"
                    style={{
                        '--preview-accent': settings.accentColor,
                        fontSize: settings.fontSize === 'small' ? '14px' : settings.fontSize === 'large' ? '18px' : '16px'
                    } as React.CSSProperties}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: settings.accentColor }}
                        >
                            V
                        </div>
                        <div>
                            <div className="text-white font-medium">VaultConnect</div>
                            <div className="text-xs text-slate-500">今日 12:00</div>
                        </div>
                    </div>
                    <p className="text-slate-300">これはプレビューテキストです。フォントサイズとテーマの変更がここに反映されます。</p>
                </div>
            </div>
        </div>
    );
};
