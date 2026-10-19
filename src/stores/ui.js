import { create } from 'zustand';

export const useUi = create((set) => ({
  theme: 'dark',
  setTheme: (theme) => {
    document.documentElement.dataset.theme = theme;
    set({ theme });
  },
}));
