/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router";
import fa from "../../i18n/fa";
import type { HistoryItem, SentimentLabel } from "../../types/sentiment";
import useSentimentStore from "../../stores/useSentimentStore";

const t = fa.analyzer;
const tc = fa.common;

const SENTIMENT_CONFIG: Record<
  SentimentLabel,
  {
    labelFa: string;
    labelEn: string;
    icon: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    dotColor: string;
  }
> = {
  positive: {
    labelFa: t.sentimentPositive,
    labelEn: "Positive",
    icon: "😊",
    textColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
    dotColor: "bg-green-500",
  },
  neutral: {
    labelFa: t.sentimentNeutral,
    labelEn: "Neutral",
    icon: "😐",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
  },
  negative: {
    labelFa: t.sentimentNegative,
    labelEn: "Negative",
    icon: "😞",
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
  },
};

function ConfidenceBar({ value }: { value: number }) {
  const [width, setWidth] = useState(0);
  const pct = Math.round(value * 100);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);
  const barColor = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  const textColor = pct >= 70 ? "text-green-600 dark:text-green-400" : pct >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-400">{t.confidence}</span>
        <span className={`text-xs font-medium ${textColor}`}>{pct}٪</span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ResultCard({ animate }: { animate: boolean }) {
  const result = useSentimentStore((s) => s.result);
  if (!result) return null;
  const cfg = SENTIMENT_CONFIG[result.sentiment];
  return (
    <div className={`mt-4 rounded-2xl border p-5 transition-all duration-400 ${cfg.bgColor} ${cfg.borderColor} ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center text-2xl shrink-0">{cfg.icon}</div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{t.resultTitle}</p>
          <p className={`text-xl font-bold ${cfg.textColor}`}>
            {cfg.labelFa}
            <span className="text-sm text-gray-400 font-normal mr-2">{cfg.labelEn}</span>
          </p>
        </div>
      </div>
      <ConfidenceBar value={result.confidence} />
      {result.cleaned_text && (
        <div className="mt-3 p-3 bg-white/60 dark:bg-gray-900/60 rounded-xl">
          <p className="text-xs text-gray-400 mb-1">{t.cleanedText}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-right" dir="rtl">{result.cleaned_text}</p>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, count, total, colorClass }: { label: string; count: number; total: number; colorClass: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
      <p className={`text-xl font-bold ${colorClass}`}>{count}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      <p className="text-xs text-gray-300 dark:text-gray-600">{pct}٪</p>
    </div>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  const deleteItem = useSentimentStore((s) => s.deleteItem);
  const cfg = SENTIMENT_CONFIG[item.sentiment];
  const date = new Date(item.created_at);
  const timeStr = date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 group">
      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${cfg.dotColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 dark:text-gray-300 truncate text-right" dir="rtl">{item.input_text}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.textColor} ${cfg.bgColor} ${cfg.borderColor}`}>{cfg.labelFa}</span>
          <span className="text-xs text-gray-300">{Math.round(item.confidence * 100)}٪</span>
          <span className="text-xs text-gray-300 mr-auto">{dateStr} · {timeStr}</span>
        </div>
      </div>
      <button onClick={() => deleteItem(item.id)} className="text-gray-200 hover:text-red-400 transition-colors text-xl leading-none px-1 opacity-0 group-hover:opacity-100" title={tc.delete}>×</button>
    </div>
  );
}

export default function TextAnalyzer() {
  const { inputText, setInputText, analyze, isAnalyzing, analyzeError, result, history, historyTotal, historyPage, historyFilter, isHistoryLoading, setHistoryPage, setHistoryFilter, fetchHistory, stats, fetchStats } = useSentimentStore();
  const [resultAnimate, setResultAnimate] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { fetchHistory(); fetchStats(); }, []);

  useEffect(() => {
    if (result) {
      // avoid calling setState synchronously inside effect — reset on next tick
      const resetTimer = setTimeout(() => setResultAnimate(false), 0);
      const timer = setTimeout(() => setResultAnimate(true), 50);
      return () => { clearTimeout(resetTimer); clearTimeout(timer); };
    }
  }, [result]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); analyze(); }
  };

  const totalPages = Math.ceil(historyTotal / 5);
  const canAnalyze = !isAnalyzing && inputText.trim().length > 0;

  const filterOptions: { value: SentimentLabel | ""; label: string }[] = [
    { value: "", label: t.filterAll },
    { value: "positive", label: t.filterPositive },
    { value: "neutral", label: t.filterNeutral },
    { value: "negative", label: t.filterNegative },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
          <Link to="/" className="hover:text-gray-600 transition-colors">{fa.nav.home}</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300">{t.pageTitle}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.pageTitle}</h1>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">{t.badge}</span>
          </div>
          <p className="text-sm text-gray-400">{t.pageSubtitle}</p>
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex justify-between items-center px-4 pt-3 pb-1">
            <span className="text-xs font-medium text-gray-400">{t.inputLabel}</span>
            <span className="text-xs text-gray-300">فارسی</span>
          </div>
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.inputPlaceholder}
            rows={4}
            dir="rtl"
            className="w-full px-4 py-3 bg-transparent border-none outline-none resize-y text-base leading-relaxed text-right text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 font-[inherit]"
            style={{ minHeight: 110 }}
          />
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-300">
              {inputText.length > 0 ? `${inputText.length} ${t.chars} · ${t.inputHint}` : t.inputHint}
            </span>
            {/* INDIGO button — NOT red. Red is reserved for Digikala brand CTAs on landing. */}
            <button
              onClick={() => analyze()}
              disabled={!canAnalyze}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-white ${canAnalyze ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"}`}
            >
              {isAnalyzing ? (
                <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />{t.analyzingBtn}</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>{t.analyzeBtn}</>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {analyzeError && (
          <div className="mt-3 px-4 py-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 text-right">{t.errorApi}</div>
        )}

        {/* Result */}
        <ResultCard animate={resultAnimate} />

        {/* Stats */}
        {stats && stats.total > 0 && (
          <div className="mt-8">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3 text-right">{t.statsTitle}</p>
            <div className="flex gap-2">
              <StatPill label={t.statsPositive} count={stats.positive_count} total={stats.total} colorClass="text-green-600 dark:text-green-400" />
              <StatPill label={t.statsNeutral}  count={stats.neutral_count}  total={stats.total} colorClass="text-amber-600 dark:text-amber-400" />
              <StatPill label={t.statsNegative} count={stats.negative_count} total={stats.total} colorClass="text-red-600 dark:text-red-400" />
              <StatPill label={t.statsTotal}    count={stats.total}          total={stats.total} colorClass="text-gray-700 dark:text-gray-300" />
            </div>
          </div>
        )}

        {/* History */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1.5">
              {filterOptions.map(({ value, label }) => {
                const active = historyFilter === value;
                const cfg = value ? SENTIMENT_CONFIG[value] : null;
                return (
                  <button key={value} onClick={() => setHistoryFilter(value)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${active ? cfg ? `${cfg.textColor} ${cfg.bgColor} ${cfg.borderColor} font-medium` : "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-gray-300 font-medium" : "text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800"}`}>
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-medium text-gray-400">{t.historyTitle}{historyTotal > 0 ? ` · ${historyTotal}` : ""}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 min-h-15 shadow-sm">
            {isHistoryLoading ? (
              <p className="text-center py-6 text-sm text-gray-300">{t.historyLoading}</p>
            ) : history.length === 0 ? (
              <p className="text-center py-6 text-sm text-gray-300">{historyFilter ? t.historyEmptyFiltered : t.historyEmpty}</p>
            ) : (
              history.map((item) => <HistoryRow key={item.id} item={item} />)
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-3">
              <button disabled={historyPage === 1} onClick={() => setHistoryPage(historyPage - 1)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 disabled:opacity-30 hover:border-gray-200 transition-colors">{t.prevPage}</button>
              <span className="text-xs text-gray-300 px-2">{historyPage} / {totalPages}</span>
              <button disabled={historyPage === totalPages} onClick={() => setHistoryPage(historyPage + 1)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 disabled:opacity-30 hover:border-gray-200 transition-colors">{t.nextPage}</button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-200 dark:text-gray-700 mt-10">{fa.appName} · پردازش زبان طبیعی فارسی</p>
      </div>
    </div>
  );
}