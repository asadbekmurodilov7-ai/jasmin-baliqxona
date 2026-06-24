import React, { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'uz' | 'ru';
export type Theme = 'dark' | 'light';

interface SettingsContextValue {
  lang: Lang;
  theme: Theme;
  setLang: (l: Lang) => void;
  setTheme: (t: Theme) => void;
  toggleLang: () => void;
  toggleTheme: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('jasmin_lang');
    return saved === 'ru' || saved === 'uz' ? saved : 'uz';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('jasmin_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // saytning asosiy ko'rinishi qorong'i
  });

  // Apply theme class to <html> so Tailwind `dark:` variants work
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('jasmin_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('jasmin_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const setTheme = (t: Theme) => setThemeState(t);
  const toggleLang = () => setLangState(prev => (prev === 'uz' ? 'ru' : 'uz'));
  const toggleTheme = () => setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <SettingsContext.Provider value={{ lang, theme, setLang, setTheme, toggleLang, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
