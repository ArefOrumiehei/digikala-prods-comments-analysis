/* eslint-disable react-hooks/exhaustive-deps */
import { type KeyboardEvent, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import useProductStore from "../../stores/useProductStrore";
import fa from "../../i18n/fa";
import type { ProductSearchResult } from "../../types/sentiment";
import { IconArrowNarrowLeft, IconSearch, IconShoppingCartSearch } from "@tabler/icons-react";
import { RatingStars } from "../../components/common/RatingStars";

const t = fa.search;

function ProductCard({ result }: { result: ProductSearchResult }) {

  return (
    <div className="w-full text-right bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link to={`/products/${result.product_id}`}>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-1 truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {result.title || "—"}
            </h3>
          </Link>

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {result.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {result.category}
              </span>
            )}
            {result.brand && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                {result.brand}
              </span>
            )}
          </div>

          {/* Rating + comment count */}
          <div className="flex items-center gap-3">
            <RatingStars rate={result.avg_rate} useIn="search" />
            {result.total_comments != null && (
              <span className="text-xs text-gray-300 dark:text-gray-600">
                {result.total_comments.toLocaleString("fa-IR")} {t.totalComments}
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <Link to={`/products/${result.product_id}`} className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 group-hover:bg-red-50 dark:group-hover:bg-red-950 transition-colors">
          <IconArrowNarrowLeft size={14} stroke={2} className="text-gray-300 dark:text-gray-600 group-hover:text-red-500 transition-colors" />
        </Link>
      </div>
    </div>
  );
}

export default function ProductSearch() {
  const {
    searchQuery,
    setSearchQuery,
    search,
    searchResults,
    isSearching,
    searchError,
    clearSearch,
    searchPagination,
    setSearchPage
  } = useProductStore();
  
  const [searchParams, setSearchParams] = useSearchParams();

  const totalPages = Math.ceil(searchPagination.total / searchPagination.size);
  
  // Sync URL query param → store on mount
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
      search();
    }
    return () => clearSearch();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearchParams({ q: searchQuery });
    search();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
          <Link to="/" className="hover:text-gray-600 transition-colors">
            {fa.nav.home}
          </Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300">{t.pageTitle}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t.pageTitle}
            </h1>
          </div>
          <p className="text-sm text-gray-400">{t.pageSubtitle}</p>
        </div>

        {/* Search box */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm flex items-center gap-2 pr-4 mb-8">
          <IconSearch size={16} stroke={2} color={"white"} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.searchPlaceholder}
            dir="rtl"
            className="flex-1 py-4 bg-transparent border-none outline-none text-base text-right text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 font-[inherit]"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="m-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-white bg-gray-700 hover:bg-gray-800 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {isSearching ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              t.searchBtn
            )}
          </button>
        </div>

        {/* Error */}
        {searchError && (
          <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 text-right">
            {searchError}
          </div>
        )}

        {/* Results */}
        {searchResults.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3 text-right">
              {searchPagination.total.toLocaleString("fa-IR")} محصول
            </p>
            <div className="flex flex-col gap-3">
              {searchResults.map((r) => (
                <ProductCard key={r.product_id} result={r} />
              ))}
            </div>
          </div>
        )}

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              disabled={searchPagination.page === 1}
              onClick={() => setSearchPage(searchPagination.page - 1)}
              className="text-xs px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              {t.prevPage}
            </button>
            <span className="text-xs text-gray-300 px-3">
              {searchPagination.page} / {totalPages}
            </span>
            <button
              disabled={searchPagination.page === totalPages}
              onClick={() => setSearchPage(searchPagination.page + 1)}
              className="text-xs px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              {t.nextPage}
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isSearching && searchResults.length === 0 && searchQuery && !searchError && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4 text-2xl">
              🔍
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm">{t.notFound}</p>
          </div>
        )}

        {/* Initial state — no search yet */}
        {!isSearching && searchResults.length === 0 && !searchQuery && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-4 text-3xl">
              <IconShoppingCartSearch stroke={2} color="white" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              نام محصول، برند یا دسته‌بندی را جستجو کنید
            </p>
          </div>
        )}
      </div>
    </div>
  );
}