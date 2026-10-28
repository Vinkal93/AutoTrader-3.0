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
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  confirmDialog: ConfirmDialogState | null;
  openConfirmDialog: (params: Omit<ConfirmDialogState, 'isOpen'>) => void;
  closeConfirmDialog: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
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
