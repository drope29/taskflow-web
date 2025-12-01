// app/accessibility/theme-provider.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AccessibilityTheme = 'default' | 'high-contrast' | 'dark' | 'dyslexia';

interface AccessibilityContextProps {
  theme: AccessibilityTheme;
  setTheme: (theme: AccessibilityTheme) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextProps>({
  theme: 'default',
  setTheme: () => {},
  fontSize: 'normal',
  setFontSize: () => {},
  reducedMotion: false,
  setReducedMotion: () => {},
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  // Tema
  const [theme, setTheme] = useState<AccessibilityTheme>('default');
  // Tamanho da fonte
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  // Redução de movimento
  const [reducedMotion, setReducedMotion] = useState(false);

  // Persistência no localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('accessibility-theme') as AccessibilityTheme;
    const savedFontSize = localStorage.getItem('accessibility-font-size') as any;
    const savedMotion = localStorage.getItem('accessibility-reduced-motion') === 'true';

    if (savedTheme) setTheme(savedTheme);
    if (savedFontSize) setFontSize(savedFontSize);
    if (savedMotion) setReducedMotion(savedMotion);
  }, []);

  useEffect(() => {
    localStorage.setItem('accessibility-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('accessibility-font-size', fontSize);
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('accessibility-reduced-motion', String(reducedMotion));
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [reducedMotion]);

  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        setTheme,
        fontSize,
        setFontSize,
        reducedMotion,
        setReducedMotion,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);