'use client';

import { useEffect } from 'react';

function applyThemeFromStorage() {
  try {
    const raw = window.localStorage.getItem('beer-portal-data');
    const parsed = raw ? JSON.parse(raw) : null;
    const theme = parsed?.profile?.theme ?? 'Sáng';

    document.documentElement.classList.toggle('dark', theme === 'Tối');
  } catch {
    document.documentElement.classList.remove('dark');
  }
}

export default function ThemeInitializer() {
  useEffect(() => {
    applyThemeFromStorage();

    const onThemeChange = () => applyThemeFromStorage();
    const onStorage = () => applyThemeFromStorage();

    window.addEventListener('portal-theme-change', onThemeChange);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('portal-theme-change', onThemeChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return null;
}
