import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, t as translate, detectLanguage, LANGUAGES } from './translations';
import { ref, set, get, onValue } from 'firebase/database';
import { database } from '../firebase/config';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations.ja) => string;
    languages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
    uid?: string;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, uid }) => {
    const [language, setLanguageState] = useState<Language>(detectLanguage());

    // Load language from Firebase if user is authenticated
    useEffect(() => {
        if (!uid) return;

        const langRef = ref(database, `userSettings/${uid}/language`);

        const unsubscribe = onValue(langRef, (snapshot) => {
            if (snapshot.exists()) {
                setLanguageState(snapshot.val() as Language);
            }
        });

        return () => unsubscribe();
    }, [uid]);

    // Save language to Firebase
    const setLanguage = async (lang: Language) => {
        setLanguageState(lang);

        if (uid) {
            const langRef = ref(database, `userSettings/${uid}/language`);
            await set(langRef, lang);
        }

        // Also save to localStorage for non-authenticated users
        localStorage.setItem('vaultconnect-language', lang);
    };

    // Load from localStorage on init
    useEffect(() => {
        const savedLang = localStorage.getItem('vaultconnect-language') as Language;
        if (savedLang && LANGUAGES.some(l => l.code === savedLang)) {
            setLanguageState(savedLang);
        }
    }, []);

    const t = (key: keyof typeof translations.ja): string => {
        return translate(key, language);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
