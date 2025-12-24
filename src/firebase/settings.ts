// User settings service for UI customization - Extended version
import { ref, set, get, onValue } from 'firebase/database';
import { database } from './config';

export type ThemeMode = 'dark' | 'light' | 'auto';
export type FontSize = 'xs' | 'small' | 'medium' | 'large' | 'xl';
export type FontFamily = 'system' | 'sans' | 'serif' | 'mono' | 'rounded';
export type CardStyle = 'default' | 'bordered' | 'elevated' | 'glass' | 'minimal';
export type AvatarShape = 'circle' | 'rounded' | 'square';
export type AnimationLevel = 'none' | 'minimal' | 'full';

export type UserSettings = {
    // Theme
    theme: ThemeMode;
    accentColor: string;

    // Typography
    fontSize: FontSize;
    fontFamily: FontFamily;

    // Layout
    compactMode: boolean;
    sidebarCollapsed: boolean;

    // Cards
    cardStyle: CardStyle;
    avatarShape: AvatarShape;
    showAvatars: boolean;

    // Animations
    animationLevel: AnimationLevel;

    // Background
    customBackground: string;
    backgroundOpacity: number;

    // Advanced
    borderRadius: number;
    contentWidth: 'narrow' | 'medium' | 'wide' | 'full';
};

export const DEFAULT_SETTINGS: UserSettings = {
    theme: 'dark',
    accentColor: '#6366f1',
    fontSize: 'medium',
    fontFamily: 'system',
    compactMode: false,
    sidebarCollapsed: false,
    cardStyle: 'default',
    avatarShape: 'circle',
    showAvatars: true,
    animationLevel: 'full',
    customBackground: '',
    backgroundOpacity: 100,
    borderRadius: 12,
    contentWidth: 'medium'
};

export const ACCENT_COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Fuchsia', value: '#d946ef' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Slate', value: '#64748b' }
];

export const FONT_FAMILIES = [
    { name: 'システム', value: 'system', css: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    { name: 'Sans', value: 'sans', css: '"Inter", "Helvetica Neue", Arial, sans-serif' },
    { name: 'Serif', value: 'serif', css: '"Georgia", "Times New Roman", serif' },
    { name: 'Mono', value: 'mono', css: '"JetBrains Mono", "Fira Code", monospace' },
    { name: 'Rounded', value: 'rounded', css: '"Nunito", "Comic Sans MS", cursive' }
];

export const BACKGROUND_PRESETS = [
    { name: 'なし', value: '' },
    { name: 'グラデーション1', value: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)' },
    { name: 'グラデーション2', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
    { name: 'グラデーション3', value: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)' },
    { name: 'サイバー', value: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a1a1a 100%)' },
    { name: 'オーシャン', value: 'linear-gradient(135deg, #0c1222 0%, #0e2a47 50%, #0a1628 100%)' },
    { name: 'フォレスト', value: 'linear-gradient(135deg, #0a1a0a 0%, #1a2e1a 50%, #0a1a0a 100%)' }
];

// Save user settings
export const saveUserSettings = async (uid: string, settings: Partial<UserSettings>): Promise<void> => {
    const settingsRef = ref(database, `userSettings/${uid}`);
    const current = await getUserSettings(uid);
    await set(settingsRef, { ...current, ...settings });
};

// Get user settings
export const getUserSettings = async (uid: string): Promise<UserSettings> => {
    const settingsRef = ref(database, `userSettings/${uid}`);
    const snapshot = await get(settingsRef);
    if (snapshot.exists()) {
        return { ...DEFAULT_SETTINGS, ...snapshot.val() };
    }
    return DEFAULT_SETTINGS;
};

// Subscribe to user settings
export const subscribeToUserSettings = (
    uid: string,
    callback: (settings: UserSettings) => void
): (() => void) => {
    const settingsRef = ref(database, `userSettings/${uid}`);

    return onValue(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ ...DEFAULT_SETTINGS, ...snapshot.val() });
        } else {
            callback(DEFAULT_SETTINGS);
        }
    });
};

// Apply theme to document
export const applyTheme = (settings: UserSettings): void => {
    const root = document.documentElement;
    const body = document.body;

    // Apply accent color as CSS variable
    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--accent-color-rgb', hexToRgb(settings.accentColor));

    // Apply font size
    const fontSizeMap: Record<FontSize, string> = {
        xs: '12px',
        small: '14px',
        medium: '16px',
        large: '18px',
        xl: '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);
    body.style.fontSize = fontSizeMap[settings.fontSize];

    // Apply font family
    const fontFamily = FONT_FAMILIES.find(f => f.value === settings.fontFamily);
    if (fontFamily) {
        root.style.setProperty('--font-family', fontFamily.css);
        body.style.fontFamily = fontFamily.css;
    }

    // Apply theme mode
    if (settings.theme === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
    }

    // Apply border radius
    root.style.setProperty('--border-radius', `${settings.borderRadius}px`);

    // Apply content width
    const widthMap = {
        narrow: '640px',
        medium: '768px',
        wide: '1024px',
        full: '100%'
    };
    root.style.setProperty('--content-width', widthMap[settings.contentWidth]);

    // Apply background
    if (settings.customBackground) {
        body.style.background = settings.customBackground;
    }

    // Animation classes
    body.classList.remove('no-animations', 'minimal-animations');
    if (settings.animationLevel === 'none') {
        body.classList.add('no-animations');
    } else if (settings.animationLevel === 'minimal') {
        body.classList.add('minimal-animations');
    }

    // Compact mode
    if (settings.compactMode) {
        body.classList.add('compact-mode');
    } else {
        body.classList.remove('compact-mode');
    }

    // Card style
    body.setAttribute('data-card-style', settings.cardStyle);
    body.setAttribute('data-avatar-shape', settings.avatarShape);
};

// Helper function to convert hex to rgb
function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '99, 102, 241';
}
