const fa = {
  appName: "دیجی‌سنتیمنت",
  appTagline: "تحلیل احساسات نظرات دیجی‌کالا",
  nav: {
    home: "خانه",
    analyzer: "تحلیل متن",
    products: "جستجو محصولات",
  },

  landing: {
    heroTitle: "تحلیل هوشمند",
    heroTitleHighlights: "نظرات محصولات",
    heroSubtitle:
      "دسته‌بندی نظرات محصولات دیجی‌کالا به مثبت، منفی و خنثی با استفاده از مدل‌های پیشرفته یادگیری ماشین و پردازش زبان طبیعی",
    heroCta: "شروع تحلیل",
    heroCtaSecondary: "مشاهده محصولات",

    statsComments: "نظر تحلیل‌شده",
    statsProducts: "محصول",
    statsAccuracy: "دقت مدل",

    featuresTitle: "امکانات سیستم",
    featuresSubtitle: "ابزارهای قدرتمند برای درک بهتر نظرات مشتریان",

    feature1Title: "تحلیل آنی",
    feature1Desc: "نظرات فارسی را در کمتر از یک ثانیه تحلیل کنید",

    feature2Title: "خلاصه هوشمند",
    feature2Desc: "خلاصه‌ای از تمام نظرات یک محصول به صورت خودکار",

    feature3Title: "تاریخچه کامل",
    feature3Desc: "تمام تحلیل‌های قبلی شما ذخیره و قابل مشاهده است",

    feature4Title: "دقت بالا",
    feature4Desc: "مدل بهینه‌شده با دقت ۷۹٪ بر روی داده‌های واقعی",

    howTitle: "چطوری کار می‌کنه؟",
    howStep1: "متن مورد نظر رو وارد می‌کنید",
    howStep1Desc: "متن فارسی نظر محصول را در کادر وارد کنید",
    howStep2: "پردازش هوشمند",
    howStep2Desc: "مدل NLP متن را پاکسازی و تحلیل می‌کنه",
    howStep3: "دریافت نتیجه",
    howStep3Desc: "احساس نظر با درصد اطمینان نمایش داده می‌شود",

    ctaTitle: "همین حالا امتحان کنید",
    ctaSubtitle: "تحلیل احساسات نظرات و متون فارسی در چند ثانیه",
    ctaBtn: "شروع تحلیل",
  },

  analyzer: {
    pageTitle: "تحلیل متن",
    pageSubtitle: "متن فارسی را وارد کنید تا احساس آن تشخیص داده شود",
    badge: "دیجی‌کالا NLP",
    inputLabel: "متن نظر",
    inputPlaceholder: "نظر خود را اینجا بنویسید...",
    inputHint: "Ctrl+Enter برای تحلیل",
    analyzeBtn: "تحلیل",
    analyzingBtn: "در حال تحلیل...",
    chars: "کاراکتر",

    resultTitle: "نتیجه تحلیل",
    confidence: "میزان اطمینان",
    cleanedText: "متن پردازش‌شده",

    sentimentPositive: "مثبت",
    sentimentNeutral: "خنثی",
    sentimentNegative: "منفی",

    statsTitle: "خلاصه جلسه",
    statsPositive: "مثبت",
    statsNeutral: "خنثی",
    statsNegative: "منفی",
    statsTotal: "کل",

    historyTitle: "تاریخچه",
    historyEmpty: "هنوز تحلیلی ثبت نشده — اولین نظر خود را تحلیل کنید",
    historyEmptyFiltered: "نتیجه‌ای با این فیلتر وجود ندارد",
    historyLoading: "در حال بارگذاری...",
    filterAll: "همه",
    filterPositive: "مثبت",
    filterNeutral: "خنثی",
    filterNegative: "منفی",
    prevPage: "قبلی",
    nextPage: "بعدی",

    errorEmpty: "لطفاً متن نظر را وارد کنید",
    errorApi: "خطا در اتصال به سرور. مطمئن شوید بک‌اند در حال اجراست.",
  },

  products: {
    pageTitle: "بررسی محصولات",
    pageSubtitle: "خلاصه احساسات نظرات هر محصول را مشاهده کنید",
    searchPlaceholder: "جستجوی محصول...",
    searchBtn: "جستجو",
    loadingProduct: "در حال بارگذاری محصول...",
    notFound: "محصولی یافت نشد",
    totalComments: "نظر",
    avgRate: "میانگین امتیاز",
    summaryTitle: "خلاصه نظرات",
    commentsTitle: "نظرات کاربران",
    noSummary: "خلاصه‌ای موجود نیست",
    filterAll: "همه",
    filterPositive: "مثبت",
    filterNeutral: "خنثی",
    filterNegative: "منفی",
    prevPage: "قبلی",
    nextPage: "بعدی",
    noComments: "نظری یافت نشد",
  },

  search: {
    pageTitle: "جستجوی محصولات",
    pageSubtitle: "اسم محصول مورد نظر خود را وارد کنید",
    searchPlaceholder: "جستجوی محصول...",
    searchBtn: "جستجو",
    loadingProduct: "در حال بارگذاری محصول...",
    notFound: "محصولی یافت نشد",
    totalComments: "نظر",
    avgRate: "میانگین امتیاز",
    prevPage: "قبلی",
    nextPage: "بعدی",
  },

  common: {
    loading: "در حال بارگذاری...",
    error: "خطایی رخ داد",
    retry: "تلاش مجدد",
    delete: "حذف",
    close: "بستن",
    back: "بازگشت",
    positive: "مثبت",
    neutral: "خنثی",
    negative: "منفی",
  },
};

export default fa;
export type FaStrings = typeof fa;