// ── Sentiment prediction ──────────────────────────────────────
export type SentimentLabel = "positive" | "neutral" | "negative";

export interface PredictRequest {
  text: string;
}

export interface PredictResponse {
  sentiment: SentimentLabel;
  confidence: number;
  cleaned_text: string;
}

export interface BatchPredictRequest {
  texts: string[];
}

export interface BatchPredictResponse {
  results: PredictResponse[];
}

// ── History ───────────────────────────────────────────────────
export interface HistoryItem {
  id: number;
  input_text: string;
  cleaned_text: string | null;
  sentiment: SentimentLabel;
  confidence: number;
  created_at: string;
}

export interface HistoryListResponse {
  total: number;
  page: number;
  size: number;
  results: HistoryItem[];
}

export interface HistoryStats {
  total: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
}

export interface HistoryFilters {
  page: number;
  size: number;
  sentiment: SentimentLabel | "";
}

// ── Product ───────────────────────────────────────────────────
export interface ProductSummary {
  product_id: number;
  title: string | null;
  category: string | null;
  brand: string | null;
  avg_rate: number | null;
  total_comments: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  ai_summary: string | null;
  ai_pros: string[] | null;
  ai_cons: string[] | null;
  ai_sentiment: string | null;
  last_updated: string | null;
}

export interface CommentItem {
  id: number | null;
  body: string | null;
  sentiment: SentimentLabel | null;
  confidence: number | null;
  rate: number | null;
  created_at: string | null;
}

export interface ProductCommentsResponse {
  product_id: number;
  total: number;
  page: number;
  size: number;
  comments: CommentItem[];
}

export interface ProductSearchResult {
  product_id: number;
  title: string | null;
  category: string | null;
  brand: string | null;
  avg_rate: number | null;
  total_comments: number | null;
}