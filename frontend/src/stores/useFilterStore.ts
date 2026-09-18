import { create } from 'zustand';

export interface FilterState {
  termo: string;
  summarize: boolean;
  dataInicio: string;
  dataFim: string;
  categoria: string;
  tipo: string;
  tags: string[];
  fuzzy: boolean;
  page: number;
  limit: number;
  setTermo: (termo: string) => void;
  setSummarize: (summarize: boolean) => void;
  setDataInicio: (data: string) => void;
  setDataFim: (data: string) => void;
  setCategoria: (categoria: string) => void;
  setTipo: (tipo: string) => void;
  setTags: (tags: string[]) => void;
  setFuzzy: (fuzzy: boolean) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetFilters: () => void;
}

const initialState = {
  termo: '',
  summarize: false,
  dataInicio: '',
  dataFim: '',
  categoria: '',
  tipo: '',
  tags: [] as string[],
  fuzzy: false,
  page: 1,
  limit: 10,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,
  setTermo: (termo) => set({ termo, page: 1 }),
  setSummarize: (summarize) => set({ summarize }),
  setDataInicio: (dataInicio) => set({ dataInicio, page: 1 }),
  setDataFim: (dataFim) => set({ dataFim, page: 1 }),
  setCategoria: (categoria) => set({ categoria, page: 1 }),
  setTipo: (tipo) => set({ tipo, page: 1 }),
  setTags: (tags) => set({ tags, page: 1 }),
  setFuzzy: (fuzzy) => set({ fuzzy, page: 1 }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),
  resetFilters: () => set(initialState),
}));

