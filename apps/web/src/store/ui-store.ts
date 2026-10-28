import { create } from 'zustand';

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface UIStore {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  confirmDialog: ConfirmDialogState | null;
  openConfirmDialog: (params: Omit<ConfirmDialogState, 'isOpen'>) => void;
  closeConfirmDialog: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  theme: 'light',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  confirmDialog: null,
  openConfirmDialog: (params) =>
    set({
      confirmDialog: {
        ...params,
        isOpen: true,
      },
    }),
  closeConfirmDialog: () => set({ confirmDialog: null }),
}));
