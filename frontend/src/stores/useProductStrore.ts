import { create } from "zustand";
import type {
  ProductSummary,
  ProductCommentsResponse,
  ProductSearchResult,
  SentimentLabel,
} from "../types/sentiment";
import {
  searchProducts,
  getProductSummary,
  getProductComments,
} from "../api/services/sentimentApi";

const COMMENTS_PAGE_SIZE = 10;
const SEARCH_PAGE_SIZE   = 10;

interface SearchPagination {
  total: number;
  page:  number;
  size:  number;
}

interface ProductState {
  // ── Search ────────────────────────────────────────────────
  searchQuery:      string;
  searchResults:    ProductSearchResult[];
  searchPagination: SearchPagination;
  isSearching:      boolean;
  searchError:      string;

  setSearchQuery:  (q: string) => void;
  search:          (page?: number) => Promise<void>;
  setSearchPage:   (page: number) => void;
  clearSearch:     () => void;

  // ── Product detail ────────────────────────────────────────
  product:          ProductSummary | null;
  isProductLoading: boolean;
  productError:     string;

  fetchProduct: (id: number) => Promise<void>;
  _pollForSummary: (id: number) => void;
  clearProduct: () => void;

  // ── Comments ──────────────────────────────────────────────
  comments:          ProductCommentsResponse | null;
  commentsPage:      number;
  commentsFilter:    SentimentLabel | "";
  isCommentsLoading: boolean;

  setCommentsPage:   (page: number) => void;
  setCommentsFilter: (filter: SentimentLabel | "") => void;
  fetchComments:     (productId: number) => Promise<void>;
}

const useProductStore = create<ProductState>((set, get) => ({
  // ── Search ────────────────────────────────────────────────
  searchQuery:   "",
  searchResults: [],
  searchPagination: { total: 0, page: 1, size: SEARCH_PAGE_SIZE },
  isSearching:   false,
  searchError:   "",

  setSearchQuery: (q) => set({ searchQuery: q }),

  search: async (page = 1) => {
    const { searchQuery } = get();
    if (!searchQuery.trim()) return;

    set({ isSearching: true, searchError: "" });
    try {
      const data = await searchProducts(searchQuery.trim(), page, SEARCH_PAGE_SIZE);
      set({
        searchResults:    data.results,
        searchPagination: { total: data.total, page: data.page, size: data.size },
      });
    } catch (err) {
      set({
        searchError: err instanceof Error ? err.message : "خطا در جستجو",
        searchResults: [],
      });
    } finally {
      set({ isSearching: false });
    }
  },

  // Triggered by pagination controls — keeps current query, changes page
  setSearchPage: (page) => {
    get().search(page);
  },

  clearSearch: () =>
    set({
      searchQuery:      "",
      searchResults:    [],
      searchError:      "",
      searchPagination: { total: 0, page: 1, size: SEARCH_PAGE_SIZE },
    }),

  // ── Product detail ────────────────────────────────────────
  product:          null,
  isProductLoading: false,
  productError:     "",

  fetchProduct: async (id) => {
    set({ isProductLoading: true, productError: "", product: null });
    try {
      const product = await getProductSummary(id);
      set({ product });
      get().fetchComments(id);

      if (!product.ai_summary) {
        get()._pollForSummary(id);
      }
    } catch (err) {
      set({
        productError: err instanceof Error ? err.message : "محصول یافت نشد",
      });
    } finally {
      set({ isProductLoading: false });
    }
  },

  _pollForSummary: async (id: number) => {
    const MAX_ATTEMPTS = 10;   // 10 × 4s = 40s max wait
    let attempts = 0;

    const poll = async () => {
      attempts++;
      try {
        const product = await getProductSummary(id);
        if (product.ai_summary) {
          set({ product });   // update store with summary
          return;
        }
        if (attempts < MAX_ATTEMPTS) {
          setTimeout(poll, 4000);
        }
      } catch {
        // silent
      }
    };

    setTimeout(poll, 4000);   // first check after 4s
  },

  clearProduct: () =>
    set({
      product:       null,
      productError:  "",
      comments:      null,
      commentsPage:  1,
      commentsFilter: "",
    }),

  // ── Comments ──────────────────────────────────────────────
  comments:          null,
  commentsPage:      1,
  commentsFilter:    "",
  isCommentsLoading: false,

  setCommentsPage: (page) => {
    const { product } = get();
    set({ commentsPage: page });
    if (product) get().fetchComments(product.product_id);
  },

  setCommentsFilter: (filter) => {
    const { product } = get();
    set({ commentsFilter: filter, commentsPage: 1 });
    if (product) get().fetchComments(product.product_id);
  },

  fetchComments: async (productId) => {
    const { commentsPage, commentsFilter } = get();
    set({ isCommentsLoading: true });
    try {
      const data = await getProductComments(
        productId,
        commentsPage,
        COMMENTS_PAGE_SIZE,
        commentsFilter || undefined
      );
      set({ comments: data });
    } catch {
      // silent
    } finally {
      set({ isCommentsLoading: false });
    }
  },
}));

export default useProductStore;