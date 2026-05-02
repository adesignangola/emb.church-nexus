import { create } from 'zustand';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  timeoutId: number;
}

interface ToastStore {
  toasts: Toast[];
  show: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  hide: (id: number) => void;
  hideAll: () => void;
}

let nextId = 1;

export const useToast = create<ToastStore>((set, get) => ({
  toasts: [],
  show: (message, type = 'info', duration = 3000) => {
    const id = nextId++;
    const timeoutId = window.setTimeout(() => {
      get().hide(id);
    }, duration);

    set((state) => ({
      toasts: [...state.toasts, { id, message, type, timeoutId }],
    }));
  },
  hide: (id) => {
    set((state) => {
      const toast = state.toasts.find((t) => t.id === id);
      if (toast) {
        clearTimeout(toast.timeoutId);
      }
      return {
        toasts: state.toasts.filter((t) => t.id !== id),
      };
    });
  },
  hideAll: () => {
    set((state) => {
      state.toasts.forEach((t) => clearTimeout(t.timeoutId));
      return { toasts: [] };
    });
  },
}));
