import apiInstance from "../apiInstance";
import type {
  PredictRequest,
  PredictResponse,
  BatchPredictRequest,
  BatchPredictResponse,
  HistoryListResponse,
  HistoryStats,
  HistoryFilters,
  ProductSummary,
  ProductCommentsResponse,
  ProductSearchResult,
} from "../../types/sentiment";

// ── Sentiment ─────────────────────────────────────────────────

export const predictSentiment = async (
  payload: PredictRequest
): Promise<PredictResponse> => {
  const { data } = await apiInstance.post<PredictResponse>(
    "/sentiment/predict",
    payload
  );
  return data;
};

export const predictBatch = async (
  payload: BatchPredictRequest
): Promise<BatchPredictResponse> => {
  const { data } = await apiInstance.post<BatchPredictResponse>(
    "/sentiment/predict-batch",
    payload
  );
  return data;
};

// ── History ───────────────────────────────────────────────────

export const getHistory = async (
  filters: HistoryFilters
): Promise<HistoryListResponse> => {
  const params: Record<string, string | number> = {
    page: filters.page,
    size: filters.size,
  };
  if (filters.sentiment) params.sentiment = filters.sentiment;

  const { data } = await apiInstance.get<HistoryListResponse>("/history", {
    params,
  });
  return data;
};

export const getHistoryStats = async (): Promise<HistoryStats> => {
  const { data } = await apiInstance.get<HistoryStats>("/history/stats");
  return data;
};

export const deleteHistoryItem = async (id: number): Promise<void> => {
  await apiInstance.delete(`/history/${id}`);
};

// ── Products ──────────────────────────────────────────────────

export const searchProducts = async (
  q: string,
  limit = 10
): Promise<ProductSearchResult[]> => {
  const { data } = await apiInstance.get<ProductSearchResult[]>(
    "/products/search",
    { params: { q, limit } }
  );
  return data;
};

export const getProductSummary = async (
  productId: number
): Promise<ProductSummary> => {
  const { data } = await apiInstance.get<ProductSummary>(
    `/products/${productId}`
  );
  return data;
};

export const getProductComments = async (
  productId: number,
  page = 1,
  size = 10,
  sentiment?: string
): Promise<ProductCommentsResponse> => {
  const params: Record<string, string | number> = { page, size };
  if (sentiment) params.sentiment = sentiment;

  const { data } = await apiInstance.get<ProductCommentsResponse>(
    `/products/${productId}/comments`,
    { params }
  );
  return data;
};