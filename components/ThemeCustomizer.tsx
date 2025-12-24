import React, { useState, useEffect } from 'react';
import {
    Palette, Sun, Moon, Monitor, Type, Minimize2, Maximize2, Loader2,
    Square, Circle, RectangleHorizontal, Sparkles, Zap, ZapOff,
    Image, Sliders, Layout, Eye, EyeOff
} from 'lucide-react';
import {
    UserSettings,
    ThemeMode,
    FontSize,
    FontFamily,
    CardStyle,
    AvatarShape,
    AnimationLevel,
    ACCENT_COLORS,
    FONT_FAMILIES,
    BACKGROUND_PRESETS,
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
    const [activeSection, setActiveSection] = useState<string>('theme');

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

    const sections = [
        { id: 'theme', label: 'テーマ', icon: Palette },
        { id: 'typography', label: '文字', icon: Type },
        { id: 'layout', label: 'レイアウト', icon: Layout },
        { id: 'cards', label: 'カード', icon: Square },
        { id: 'background', label: '背景', icon: Image },
        { id: 'advanced', label: '詳細', icon: Sliders }
    ];

    return (
        <div className="space-y-6">
            {/* Section Tabs */}
            <div className="flex flex-wrap gap-2">
                {sections.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveSection(id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
                {saving && <Loader2 className="w-4 h-4 animate-spin text-slate-500 ml-2 self-center" />}
            </div>

            {/* Theme Section */}
            {activeSection === 'theme' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Palette className="w-5 h-5 text-indigo-500" />
                        テーマ設定
                    </h3>

                    {/* Theme Mode */}
                    <div>
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
                    <div>
                        <label className="block text-sm text-slate-400 mb-3">アクセントカラー</label>
                        <div className="flex flex-wrap gap-2">
                            {ACCENT_COLORS.map(({ name, value }) => (
                                <button
                                    key={value}
                                    onClick={() => updateSetting('accentColor', value)}
                                    className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${settings.accentColor === value
                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                                        : ''
                                        }`}
                                    style={{ backgroundColor: value }}
                                    title={name}
                                />
                            ))}
                        </div>
                        {/* Custom color picker */}
                        <div className="mt-3 flex items-center gap-3">
                            <input
                                type="color"
                                value={settings.accentColor}
                                onChange={(e) => updateSetting('accentColor', e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent"
                            />
                            <span className="text-sm text-slate-500">カスタムカラーを選択</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Typography Section */}
            {activeSection === 'typography' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Type className="w-5 h-5 text-indigo-500" />
                        文字設定
                    </h3>

                    {/* Font Size */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-3">フォントサイズ</label>
                        <div className="flex gap-2">
                            {[
                                { size: 'xs' as FontSize, label: '極小' },
                                { size: 'small' as FontSize, label: '小' },
                                { size: 'medium' as FontSize, label: '中' },
                                { size: 'large' as FontSize, label: '大' },
                                { size: 'xl' as FontSize, label: '極大' }
                            ].map(({ size, label }) => (
                                <button
                                    key={size}
                                    onClick={() => updateSetting('fontSize', size)}
                                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${settings.fontSize === size
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Family */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-3">フォント</label>
                        <div className="grid grid-cols-2 gap-2">
                            {FONT_FAMILIES.map(({ name, value }) => (
                                <button
                                    key={value}
                                    onClick={() => updateSetting('fontFamily', value as FontFamily)}
                                    className={`px-4 py-3 rounded-lg border text-left transition-colors ${settings.fontFamily === value
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Layout Section */}
            {activeSection === 'layout' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Layout className="w-5 h-5 text-indigo-500" />
                        レイアウト設定
                    </h3>

                    {/* Content Width */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-3">コンテンツ幅</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'narrow', label: '狭い' },
                                { value: 'medium', label: '中' },
                                { value: 'wide', label: '広い' },
                                { value: 'full', label: '全幅' }
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => updateSetting('contentWidth', value as any)}
                                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${settings.contentWidth === value
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Compact Mode */}
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                                {settings.compactMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                コンパクトモード
                            </div>
                            <div className="text-xs text-slate-500 mt-1">間隔を狭くして表示</div>
                        </div>
                        <button
                            onClick={() => updateSetting('compactMode', !settings.compactMode)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${settings.compactMode ? 'bg-indigo-600' : 'bg-slate-700'
                                }`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.compactMode ? 'translate-x-7' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                </div>
            )}

            {/* Cards Section */}
            {activeSection === 'cards' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Square className="w-5 h-5 text-indigo-500" />
                        カードスタイル
                    </h3>

                    {/* Card Style */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-3">投稿カードのスタイル</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'default' as CardStyle, label: 'デフォルト' },
                                { value: 'bordered' as CardStyle, label: 'ボーダー' },
                                { value: 'elevated' as CardStyle, label: '浮き出し' },
                                { value: 'glass' as CardStyle, label: 'グラス' },
                                { value: 'minimal' as CardStyle, label: 'ミニマル' }
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => updateSetting('cardStyle', value)}
                                    className={`px-4 py-3 rounded-lg border transition-colors ${settings.cardStyle === value
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Avatar Shape */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-3">アバターの形</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'circle' as AvatarShape, label: '丸', icon: Circle },
                                { value: 'rounded' as AvatarShape, label: '角丸', icon: RectangleHorizontal },
                                { value: 'square' as AvatarShape, label: '四角', icon: Square }
                            ].map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => updateSetting('avatarShape', value)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${settings.avatarShape === value
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Show Avatars */}
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                                {settings.showAvatars ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                アバターを表示
                            </div>
                        </div>
                        <button
                            onClick={() => updateSetting('showAvatars', !settings.showAvatars)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${settings.showAvatars ? 'bg-indigo-600' : 'bg-slate-700'
                                }`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.showAvatars ? 'translate-x-7' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                </div>
            )}

            {/* Background Section */}
            {activeSection === 'background' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Image className be="w-5 h-5 text-indigo-500" />
                        背景設定
                    </h3>

                    {/* Background Presets */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-3">背景プリセット</label>
                        <div className="grid grid-cols-4 gap-2">
                            {BACKGROUND_PRESETS.map(({ name, value }) => (
                                <button
                                    key={name}
                                    onClick={() => updateSetting('customBackground', value)}
                                    className={`h-16 rounded-lg border transition-all overflow-hidden ${settings.customBackground === value
                                        ? 'ring-2 ring-indigo-500'
                                        : 'border-slate-700 hover:border-slate-600'
                                        }`}
                                    style={{ background: value || '#1e293b' }}
                                    title={name}
                                >
                                    {!value && <span className="text-xs text-slate-400">{name}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Section */}
            {activeSection === 'advanced' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-indigo-500" />
                        詳細設定
                    </h3>

                    {/* Border Radius */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-3">
                            角丸の大きさ: {settings.borderRadius}px
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="24"
                            value={settings.borderRadius}
                            onChange={(e) => updateSetting('borderRadius', parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Animation Level */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-3">アニメーション</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'none' as AnimationLevel, label: 'なし', icon: ZapOff },
                                { value: 'minimal' as AnimationLevel, label: '控えめ', icon: Zap },
                                { value: 'full' as AnimationLevel, label: 'フル', icon: Sparkles }
                            ].map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => updateSetting('animationLevel', value)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${settings.animationLevel === value
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-400 mb-3">プレビュー</h3>
                <div
                    className="p-4 rounded-lg border border-slate-700"
                    style={{
                        borderRadius: `${settings.borderRadius}px`,
                        background: settings.customBackground || undefined
                    }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className={`w-10 h-10 flex items-center justify-center text-white font-medium ${settings.avatarShape === 'circle' ? 'rounded-full' :
                                settings.avatarShape === 'rounded' ? 'rounded-lg' : 'rounded-sm'
                                }`}
                            style={{ backgroundColor: settings.accentColor }}
                        >
                            V
                        </div>
                        <div>
                            <div className="text-white font-medium">VaultConnect</div>
                            <div className="text-xs text-slate-500">プレビューテキスト</div>
                        </div>
                    </div>
                    <p className="text-slate-300">カスタマイズした設定がここに反映されます。</p>
                </div>
            </div>
        </div>
    );
};
