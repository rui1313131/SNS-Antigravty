// User settings service for UI customization
import { ref, set, get, onValue } from 'firebase/database';
import { database } from './config';

export type ThemeMode = 'dark' | 'light' | 'auto';
export type FontSize = 'small' | 'medium' | 'large';

export type UserSettings = {
    theme: ThemeMode;
    accentColor: string;
    fontSize: FontSize;
    compactMode: boolean;
};

export const DEFAULT_SETTINGS: UserSettings = {
    theme: 'dark',
    accentColor: '#6366f1', // Indigo
    fontSize: 'medium',
    compactMode: false
};

export const ACCENT_COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Blue', value: '#3b82f6' }
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

    // Apply accent color as CSS variable
    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--accent-color-rgb', hexToRgb(settings.accentColor));

    // Apply font size
    const fontSizeMap: Record<FontSize, string> = {
        small: '14px',
        medium: '16px',
        large: '18px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);

    // Apply theme mode
    if (settings.theme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }

    // Compact mode
    if (settings.compactMode) {
        document.body.classList.add('compact-mode');
    } else {
        document.body.classList.remove('compact-mode');
    }
};

// Helper function to convert hex to rgb
function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '99, 102, 241'; // Default indigo
}
