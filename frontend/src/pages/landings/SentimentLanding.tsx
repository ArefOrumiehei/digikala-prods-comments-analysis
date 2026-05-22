import { Link } from "react-router";
import fa from "../../i18n/fa";
import {toPersianDigits} from "smart-persian-tools"
import { IconArrowNarrowLeft, IconClock, IconFileDescription, IconMoodHappy, IconTrendingUp } from "@tabler/icons-react";

const t = fa.landing;
const DIGIKALA_RED = "#E22424";

function FeatureCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}15` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-right">
        {title}
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed text-right">
        {desc}
      </p>
    </div>
  );
}

// ── How-it-works step ─────────────────────────────────────────
function Step({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 z-10"
        style={{ background: DIGIKALA_RED }}
      >
        {number}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
          {title}
        </h4>
        <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <p
        className="text-4xl font-black mb-1"
        style={{ color: DIGIKALA_RED }}
      >
        {value}
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500">{label}</p>
    </div>
  );
}

export default function SentimentLanding() {
  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-950"
      dir="rtl"
    >
      {/* ── Navbar ── */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: DIGIKALA_RED }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
              {fa.appName}
            </span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="text-sm px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {fa.nav.home}
            </Link>
            <Link
              to="/text-analyzer"
              className="text-sm px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {fa.nav.analyzer}
            </Link>
            <Link
              to="/products/search"
              className="text-sm px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {fa.nav.products}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 mb-8">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: DIGIKALA_RED }}
          />
          <span className="text-xs font-medium" style={{ color: DIGIKALA_RED }}>
            {fa.appTagline}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-6">
          {t.heroTitle}{" "}
          <span
            className="relative inline-block"
            style={{ color: DIGIKALA_RED }}
          >
            {t.heroTitleHighlights}
            <svg
              className="absolute -bottom-1 right-0 w-full"
              height="6"
              viewBox="0 0 200 6"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q50 0 100 4 Q150 8 200 3"
                stroke={DIGIKALA_RED}
                strokeWidth="2"
                fill="none"
                opacity="0.4"
              />
            </svg>
          </span>
        </h1>

        <p className="text-lg text-gray-400 dark:text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
          {t.heroSubtitle}
        </p>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/products/search"
            className="px-7 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium text-base border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-900 transition-all"
          >
            {t.heroCtaSecondary}
          </Link>
          <Link
            to="/text-analyzer"
            className="flex items-center gap-2 px-7 py-3 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: DIGIKALA_RED }}
          >
            {t.heroCta} <IconArrowNarrowLeft size={24} stroke={2} />
          </Link>
        </div>

        {/* Hero visual */}
        <div className="mt-14 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-xs text-gray-300 dark:text-gray-600 mr-2">تحلیل نظر</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed" dir="rtl">
              «محصول فوق‌العاده‌ای بود! کیفیت خیلی بهتر از قیمتشه. حتماً پیشنهاد می‌کنم»
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950 flex items-center justify-center text-xl">
              <IconMoodHappy size={20} stroke={2} className="text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-600 dark:text-green-400">مثبت <span className="font-normal text-gray-400 text-xs">Positive</span></p>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "63%" }} />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{toPersianDigits("63%")} اطمینان</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-3 gap-8 divide-x divide-x-reverse divide-gray-100 dark:divide-gray-800">
            <StatCard value={toPersianDigits("6M+")} label={t.statsComments} />
            <StatCard value={toPersianDigits("1.2M+")} label={t.statsProducts} />
            <StatCard value={toPersianDigits("79%")} label={t.statsAccuracy} />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-3">
            {t.featuresTitle}
          </h2>
          <p className="text-gray-400 dark:text-gray-500">{t.featuresSubtitle}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCard
            color="#6366f1"
            title={t.feature1Title}
            desc={t.feature1Desc}
            icon={<IconClock size={20} stroke={2} className="text-indigo-500" />} 
          />
          <FeatureCard
            color="#E22424"
            title={t.feature2Title}
            desc={t.feature2Desc}
            icon={<IconFileDescription size={20} stroke={2} className="text-red-500" />}
          />
          <FeatureCard
            color="#16a34a"
            title={t.feature3Title}
            desc={t.feature3Desc}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            }
          />
          <FeatureCard
            color="#d97706"
            title={t.feature4Title}
            desc={t.feature4Desc}
            icon={<IconTrendingUp size={20} stroke={2} className="text-amber-500" />}
          />
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">
              {t.howTitle}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-12 relative">
            {/* connector lines */}
            <div className="absolute top-6 right-[20%] left-[20%] h-px bg-gray-100 dark:bg-gray-800 hidden md:block" />
            <Step number="۱" title={t.howStep1} desc={t.howStep1Desc} />
            <Step number="۲" title={t.howStep2} desc={t.howStep2Desc} />
            <Step number="۳" title={t.howStep3} desc={t.howStep3Desc} />
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div
          className="rounded-3xl p-12 text-center text-white relative overflow-hidden"
          style={{ background: DIGIKALA_RED }}
        >
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white" />
            <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full bg-white" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-3">{t.ctaTitle}</h2>
            <p className="text-white/80 mb-8 text-base">{t.ctaSubtitle}</p>
            {/* CTA on red background: white button — never another red */}
            <Link
              to="/analyzer"
              className="inline-flex items-center gap-2 bg-white font-bold px-8 py-3 rounded-xl transition-all hover:shadow-xl hover:-translate-y-0.5 text-base"
              style={{ color: DIGIKALA_RED }}
            >
              {t.ctaBtn}
              <IconArrowNarrowLeft size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: DIGIKALA_RED }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{fa.appName}</span>
          </div>
          <p className="text-xs text-gray-300 dark:text-gray-600">
            پردازش زبان طبیعی فارسی · LinearSVC · TF-IDF
          </p>
        </div>
      </footer>
    </div>
  );
}