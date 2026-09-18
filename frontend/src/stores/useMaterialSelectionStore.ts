import { create } from 'zustand';

export interface MaterialSelectionState {
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  deselectMultiple: (ids: string[]) => void;
  selectAllOnPage: (pageIds: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  isAllPageSelected: (pageIds: string[]) => boolean;
}

export const useMaterialSelectionStore = create<MaterialSelectionState>((set, get) => ({
  selectedIds: [],

  toggleSelection: (id: string) => {
    set((state) => {
      const exists = state.selectedIds.includes(id);
      return {
        selectedIds: exists
          ? state.selectedIds.filter((item) => item !== id)
          : [...state.selectedIds, id],
      };
    });
  },

  selectMultiple: (ids: string[]) => {
    set((state) => {
      const merged = Array.from(new Set([...state.selectedIds, ...ids]));
      return { selectedIds: merged };
    });
  },

  deselectMultiple: (ids: string[]) => {
    set((state) => ({
      selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
    }));
  },

  selectAllOnPage: (pageIds: string[]) => {
    set((state) => {
      const allSelected = pageIds.length > 0 && pageIds.every((id) => state.selectedIds.includes(id));
      if (allSelected) {
        // Desmarca todos da página
        return {
          selectedIds: state.selectedIds.filter((id) => !pageIds.includes(id)),
        };
      } else {
        // Marca todos da página
        const merged = Array.from(new Set([...state.selectedIds, ...pageIds]));
        return { selectedIds: merged };
      }
    });
  },

  clearSelection: () => set({ selectedIds: [] }),

  isSelected: (id: string) => get().selectedIds.includes(id),

  isAllPageSelected: (pageIds: string[]) => {
    if (pageIds.length === 0) return false;
    const { selectedIds } = get();
    return pageIds.every((id) => selectedIds.includes(id));
  },
}));
