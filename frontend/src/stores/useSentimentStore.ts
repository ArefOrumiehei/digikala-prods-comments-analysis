import { create } from "zustand";
import type {
  PredictResponse,
  HistoryItem,
  HistoryStats,
  SentimentLabel,
} from "../types/sentiment";
import {
  predictSentiment,
  getHistory,
  getHistoryStats,
  deleteHistoryItem,
} from "../api/services/sentimentApi";

const PAGE_SIZE = 5;

interface SentimentState {
  // ── Input ─────────────────────────────────────────────────
  inputText: string;
  setInputText: (text: string) => void;

  // ── Prediction result ─────────────────────────────────────
  result: PredictResponse | null;
  isAnalyzing: boolean;
  analyzeError: string;
  analyze: () => Promise<void>;
  clearResult: () => void;

  // ── History ───────────────────────────────────────────────
  history: HistoryItem[];
  historyTotal: number;
  historyPage: number;
  historyFilter: SentimentLabel | "";
  isHistoryLoading: boolean;

  setHistoryPage: (page: number) => void;
  setHistoryFilter: (filter: SentimentLabel | "") => void;
  fetchHistory: () => Promise<void>;
  deleteItem: (id: number) => Promise<void>;

  // ── Stats ─────────────────────────────────────────────────
  stats: HistoryStats | null;
  fetchStats: () => Promise<void>;
}

const useSentimentStore = create<SentimentState>((set, get) => ({
  inputText: "",
  setInputText: (text) => set({ inputText: text }),

  // ── Prediction result ─────────────────────────────────────
  result: null,
  isAnalyzing: false,
  analyzeError: "",

  analyze: async () => {
    const { inputText } = get();
    if (!inputText.trim()) return;

    set({ isAnalyzing: true, analyzeError: "", result: null });

    try {
      const result = await predictSentiment({ text: inputText.trim() });
      set({ result });
      get().fetchHistory();
      get().fetchStats();
    } catch (err) {
      set({
        analyzeError:
          err instanceof Error
            ? err.message
            : "Could not connect to the API. Make sure the backend is running.",
      });
    } finally {
      set({ isAnalyzing: false });
    }
  },

  clearResult: () => set({ result: null, analyzeError: "" }),

  // ── History ───────────────────────────────────────────────
  history: [],
  historyTotal: 0,
  historyPage: 1,
  historyFilter: "",
  isHistoryLoading: false,

  setHistoryPage: (page) => {
    set({ historyPage: page });
    get().fetchHistory();
  },

  setHistoryFilter: (filter) => {
    set({ historyFilter: filter, historyPage: 1 });
    get().fetchHistory();
  },

  fetchHistory: async () => {
    const { historyPage, historyFilter } = get();
    set({ isHistoryLoading: true });
    try {
      const data = await getHistory({
        page: historyPage,
        size: PAGE_SIZE,
        sentiment: historyFilter,
      });
      set({ history: data.results, historyTotal: data.total });
    } catch {
      // silent — history is non-critical
    } finally {
      set({ isHistoryLoading: false });
    }
  },

  deleteItem: async (id) => {
    try {
      await deleteHistoryItem(id);
      get().fetchHistory();
      get().fetchStats();
    } catch {
      // silent
    }
  },

  // ── Stats ─────────────────────────────────────────────────
  stats: null,

  fetchStats: async () => {
    try {
      const stats = await getHistoryStats();
      set({ stats });
    } catch {
      // silent
    }
  },
}));

export default useSentimentStore;