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
  setTermo: (termo: string) => void;
  setSummarize: (summarize: boolean) => void;
  setDataInicio: (data: string) => void;
  setDataFim: (data: string) => void;
  setCategoria: (categoria: string) => void;
  setTipo: (tipo: string) => void;
  setTags: (tags: string[]) => void;
  setFuzzy: (fuzzy: boolean) => void;
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
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,
  setTermo: (termo) => set({ termo }),
  setSummarize: (summarize) => set({ summarize }),
  setDataInicio: (dataInicio) => set({ dataInicio }),
  setDataFim: (dataFim) => set({ dataFim }),
  setCategoria: (categoria) => set({ categoria }),
  setTipo: (tipo) => set({ tipo }),
  setTags: (tags) => set({ tags }),
  setFuzzy: (fuzzy) => set({ fuzzy }),
  resetFilters: () => set(initialState),
}));
