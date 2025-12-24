import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../src/i18n/LanguageContext';

export const LanguageSelector: React.FC = () => {
    const { language, setLanguage, languages, t } = useLanguage();

    return (
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-indigo-500" />
                {t('language')}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all ${language === lang.code
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                            }`}
                    >
                        <span className="text-lg font-medium">{lang.nativeName}</span>
                        <span className="text-xs opacity-60">{lang.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
