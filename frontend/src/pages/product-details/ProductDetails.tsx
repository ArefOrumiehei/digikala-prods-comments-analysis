/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import useProductStore from "../../stores/useProductStrore";
import type { SentimentLabel, CommentItem } from "../../types/sentiment";
import fa from "../../i18n/fa";
import { RatingStars } from "../../components/common/RatingStars";
import { IconFileAi, IconMoodEmpty, IconMoodHappy, IconMoodSad } from "@tabler/icons-react";

const t = fa.products;
const DIGIKALA_RED = "#E22424";

const SENTIMENT_CONFIG: Record<
  SentimentLabel,
  { labelFa: string; textColor: string; bgColor: string; borderColor: string; dotColor: string }
> = {
  positive: {
    labelFa: fa.common.positive,
    textColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
    dotColor: "bg-green-500",
  },
  neutral: {
    labelFa: fa.common.neutral,
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
  },
  negative: {
    labelFa: fa.common.negative,
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
  },
};


function SentimentBar({
  label, count, total, colorClass, barColor,
}: {
  label: string; count: number; total: number; colorClass: string; barColor: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-medium w-10 text-right shrink-0 ${colorClass}`}>
        {label}
      </span>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-12 text-left shrink-0">
        {Math.round(pct)}٪ ({count.toLocaleString("fa-IR")})
      </span>
    </div>
  );
}

function CommentCard({ comment }: { comment: CommentItem }) {
  const sentiment = comment.sentiment as SentimentLabel | null;
  const cfg = sentiment ? SENTIMENT_CONFIG[sentiment] : null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {cfg && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.textColor} ${cfg.bgColor} ${cfg.borderColor}`}>
              {cfg.labelFa}
            </span>
          )}
          {comment.confidence != null && (
            <span className="text-xs text-gray-300 dark:text-gray-600">
              {Math.round(comment.confidence * 100)}٪
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {comment.rate != null && (
            <RatingStars rate={comment.rate} useIn="comment" />
          )}
          {comment.created_at && (
            <span className="text-xs text-gray-300 dark:text-gray-600">
              {comment.created_at}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      {comment.body ? (
        <p
          className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-right"
          dir="rtl"
        >
          {comment.body}
        </p>
      ) : (
        <p className="text-sm text-gray-300 dark:text-gray-600 italic text-right">
          متنی ثبت نشده
        </p>
      )}
    </div>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl ${className}`} />
  );
}

function ProductSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-8 w-2/3" />
      <SkeletonBlock className="h-4 w-1/3" />
      <SkeletonBlock className="h-32" />
      <SkeletonBlock className="h-24" />
      <SkeletonBlock className="h-24" />
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    product,
    isProductLoading,
    productError,
    fetchProduct,
    clearProduct,
    comments,
    commentsPage,
    commentsFilter,
    isCommentsLoading,
    setCommentsPage,
    setCommentsFilter,
  } = useProductStore();

  useEffect(() => {
    if (id) fetchProduct(Number(id));
    return () => clearProduct();
  }, [id]);

  const totalCommentPages = comments
    ? Math.ceil(comments.total / 10)
    : 0;

  const filterOptions: { value: SentimentLabel | ""; label: string }[] = [
    { value: "", label: t.filterAll },
    { value: "positive", label: t.filterPositive },
    { value: "neutral", label: t.filterNeutral },
    { value: "negative", label: t.filterNegative },
  ];

  // ── Loading ──
  if (isProductLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <ProductSkeleton />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (productError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{productError}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            {fa.common.back}
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-400 flex-wrap">
          <Link to="/" className="hover:text-gray-600 transition-colors">{fa.nav.home}</Link>
          <span>/</span>
          <Link to="/products/search" className="hover:text-gray-600 transition-colors">{fa.search.pageTitle}</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">
            {product.title || product.product_id}
          </span>
        </div>

        {/* ── Product header ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-4 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-snug" dir="rtl">
                {product.title || "—"}
              </h1>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {product.category && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {product.category}
                  </span>
                )}
                {product.brand && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                    {product.brand}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <RatingStars rate={product.avg_rate} useIn="detail" />
                <span className="text-xs text-gray-300 dark:text-gray-500">
                  {product.total_comments.toLocaleString("fa-IR")} {t.totalComments}
                </span>
              </div>
            </div>

            {/* Overall sentiment badge */}
            <div className="shrink-0 text-center">
              {(() => {
                const dominant =
                  product.positive_count >= product.neutral_count &&
                  product.positive_count >= product.negative_count
                    ? "positive"
                    : product.negative_count >= product.neutral_count
                    ? "negative"
                    : "neutral";
                const cfg = SENTIMENT_CONFIG[dominant];
                const icons = { positive: <IconMoodHappy  size={32} stroke={2} className={cfg.textColor} />, neutral: <IconMoodEmpty size={32} stroke={2} className={cfg.textColor} />, negative: <IconMoodSad size={32} stroke={2} className={cfg.textColor} /> };
                return (
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${cfg.bgColor} border ${cfg.borderColor}`}>
                    <span className="text-2xl">{icons[dominant]}</span>
                    <span className={`text-xs font-medium mt-0.5 ${cfg.textColor}`}>
                      {cfg.labelFa}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Sentiment bars */}
          <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <SentimentBar
              label={fa.common.positive}
              count={product.positive_count}
              total={product.total_comments}
              colorClass="text-green-600 dark:text-green-400"
              barColor="bg-green-500"
            />
            <SentimentBar
              label={fa.common.neutral}
              count={product.neutral_count}
              total={product.total_comments}
              colorClass="text-amber-600 dark:text-amber-400"
              barColor="bg-amber-500"
            />
            <SentimentBar
              label={fa.common.negative}
              count={product.negative_count}
              total={product.total_comments}
              colorClass="text-red-600 dark:text-red-400"
              barColor="bg-red-500"
            />
          </div>
        </div>

        {/* ── AI Summary ── */}
        {product.ai_summary && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: DIGIKALA_RED }}
              >
                <IconFileAi size={18} stroke={2} color="white" />
              </div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                {t.summaryTitle}
              </h2>
            </div>

            {/* Summary sentences — split by " | " */}
            <div className="space-y-2">
              {product.ai_summary.split(" | ").map((sentence, i) => (
                sentence.trim() && (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                      style={{ background: DIGIKALA_RED }}
                    />
                    <p
                      className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-right flex-1"
                      dir="rtl"
                    >
                      {sentence.trim()}
                    </p>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* ── Comments ── */}
        <div>
          {/* Comments header + filter */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1.5">
              {filterOptions.map(({ value, label }) => {
                const active = commentsFilter === value;
                const cfg = value ? SENTIMENT_CONFIG[value] : null;
                return (
                  <button
                    key={value}
                    onClick={() => setCommentsFilter(value)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      active
                        ? cfg
                          ? `${cfg.textColor} ${cfg.bgColor} ${cfg.borderColor} font-medium`
                          : "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-gray-300 font-medium"
                        : "text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800 hover:border-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <h2 className="font-bold text-gray-900 dark:text-gray-100 text-base">
              {t.commentsTitle}
              {comments && (
                <span className="text-sm font-normal text-gray-400 mr-2">
                  · {comments.total.toLocaleString("fa-IR")}
                </span>
              )}
            </h2>
          </div>

          {/* Comment list */}
          {isCommentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-28" />
              ))}
            </div>
          ) : comments && comments.comments.length > 0 ? (
            <div className="space-y-3">
              {comments.comments.map((c, i) => (
                <CommentCard key={c.id ?? i} comment={c} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
              <p className="text-gray-300 dark:text-gray-600 text-sm">{t.noComments}</p>
            </div>
          )}

          {/* Pagination */}
          {totalCommentPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                disabled={commentsPage === 1}
                onClick={() => setCommentsPage(commentsPage - 1)}
                className="text-xs px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 disabled:opacity-30 hover:border-gray-200 transition-colors"
              >
                {t.prevPage}
              </button>
              <span className="text-xs text-gray-300 dark:text-gray-600 px-3">
                {commentsPage.toLocaleString("fa-IR")} / {totalCommentPages.toLocaleString("fa-IR")}
              </span>
              <button
                disabled={commentsPage === totalCommentPages}
                onClick={() => setCommentsPage(commentsPage + 1)}
                className="text-xs px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 disabled:opacity-30 hover:border-gray-200 transition-colors"
              >
                {t.nextPage}
              </button>
            </div>
          )}
        </div>

        {/* Last updated */}
        {product.last_updated && (
          <p className="text-center text-xs text-gray-200 dark:text-gray-700 mt-8">
            آخرین به‌روزرسانی: {new Date(product.last_updated).toLocaleDateString("fa-IR")}
          </p>
        )}
      </div>
    </div>
  );
}