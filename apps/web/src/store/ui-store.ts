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
  activeBrokerConnectionId: string | null;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setActiveBrokerConnectionId: (id: string | null) => void;
  confirmDialog: ConfirmDialogState | null;
  openConfirmDialog: (params: Omit<ConfirmDialogState, 'isOpen'>) => void;
  closeConfirmDialog: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  theme: 'light',
  activeBrokerConnectionId: null,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setActiveBrokerConnectionId: (id) => set({ activeBrokerConnectionId: id }),
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
