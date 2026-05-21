# 🛒 Digikala Comments Sentiment Analysis

A Persian NLP pipeline that classifies **6 million product comments** from Digikala (Iran's largest e-commerce platform) into **positive / neutral / negative** sentiment, served via a FastAPI backend with SQLite history tracking.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Dataset](#dataset)
- [ML Pipeline](#ml-pipeline)
- [Model Performance](#model-performance)
- [Backend API](#backend-api)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [API Reference](#api-reference)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)

---

## Project Overview

This project builds an end-to-end sentiment analysis system for Persian-language product reviews. It covers:

- **Data engineering** — merging 6M comments with 1.2M product records
- **Feature engineering** — 30+ features including text, rating, buyer status, reactions, price, and temporal signals
- **Persian NLP preprocessing** — Hazm normalisation, tokenisation, stopword handling
- **Multi-model training** — Logistic Regression, Linear SVM, Random Forest
- **Model improvement** — TF-IDF tuning, GridSearchCV, SMOTE oversampling, Voting Ensemble
- **Extractive summarization** — TF-IDF based comment body summarizer (no external API)
- **REST API** — FastAPI backend with prediction, history tracking, and product analytics
- **SQLite database** — stores user prediction history and cached product summaries

---

## Project Structure

```
digikala-prods-comments-analysis/
│
├── backend/                              # FastAPI application
│   ├── api/
│   │   ├── main.py                       # App entry point + CORS + lifespan
│   │   ├── database.py                   # SQLite async engine & session
│   │   ├── db_models.py                  # SQLAlchemy ORM table definitions
│   │   ├── models.py                     # Pydantic request/response schemas
│   │   ├── predictor.py                  # Model loading, inference & summarizer
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── sentiment.py              # Prediction endpoints
│   │       ├── history.py                # Prediction history endpoints
│   │       └── products.py               # Product summary endpoints
│   ├── digikala_comments_sentiment.d     # SQLite database (auto-created)
│   └── requirements_api.txt
│
├── frontend/                             # Web app (in progress)
│
├── data/
│   ├── raw/
│   │   ├── digikala-comments.csv         # ~6M comment records
│   │   └── digikala-products.csv         # ~1.2M product records
│   └── processed/
│       └── sentiment_analysis/
│           ├── merged_200k.csv
│           ├── data_with_features.csv
│           └── preprocessed_data.csv
│
├── notebooks/
|   |── eda_comments.ipynb
|   |── eda_products.ipynb
│   └── comments_sentiment_analysis.ipynb # Full ML pipeline (9 cells)
│
├── src/
|   |── data/
|   |   |── model_improvment_comparison.csv
│   └── models/
│       ├── final_best_model.pkl          # Tuned LinearSVC
│       ├── final_tfidf_vectorizer.pkl    # Fitted TF-IDF vectoriser
│       ├── model_improvement_comparison.csv
│       └── final_model_report.txt
│
├── reports/
|   |── visualizations/
|   |   |── model_improvment_comprision.png
|   |── texts/
|   |   |── final_model_report.txt
│   └── figures/
│       ├── model_comparison.png
│       ├── confusion_matrix_best_model.png
│       └── model_improvement_comparison.png
│
└── README.md <-- You are here
```

---

## Dataset

| Dataset | Records | Description |
|---|---|---|
| Comments | ~6,000,000 | User reviews with rating, recommendation, likes/dislikes |
| Products | ~1,200,000 | Product info with category, price, brand, seller |

> Development and training was done on a **100k–200k row sample**. The pipeline is designed to scale to the full dataset via chunked processing.

### Sentiment Label Distribution (100k sample)

| Sentiment | Count | % |
|---|---|---|
| Positive | ~60,000 | ~60% |
| Neutral | ~18,000 | ~18% |
| Negative | ~11,000 | ~11% |

Labels are derived from star rating (primary signal) and recommendation status (fallback).

---

## ML Pipeline

The notebook (`notebooks/comments_sentiment_analysis.ipynb`) is organised into 9 cells:

| Cell | Purpose |
|---|---|
| 0 | Imports & global settings |
| 1 | Data loading & merging (comments + products) |
| 2 | Feature engineering (30+ features across 7 groups) |
| 3 | Persian text preprocessing function (Hazm) |
| 4 | Apply preprocessing → cleaned text columns |
| 5 | Exploratory Data Analysis (EDA) |
| 6 | Multi-model training & baseline comparison |
| 7 | Error analysis & misclassification deep-dive |
| 8 | Model improvement (TF-IDF tuning, GridSearch, SMOTE, Ensemble) |

### Feature Engineering Groups

1. **Text features** — character counts, word counts, average word length
2. **Recommendation** — binary encoded Persian recommendation status
3. **Buyer status** — verified buyer flag
4. **Rate features** — star rating, rate gap vs product average
5. **Reaction features** — likes, dislikes, like-ratio
6. **Price features** — discount %, availability flag
7. **Temporal features** — day, month, season from Persian (Jalali) calendar

---

## Model Performance

### Baseline Comparison (Cell 6)

| Model | Test Acc |
|---|---|
| Logistic Regression | ~76% |
| Linear SVM | ~76% |
| Random Forest | ~75% |

### Improvement Results (Cell 8)

| Strategy | Accuracy | Macro F1 |
|---|---|---|
| Baseline (Original) | 76.09% | 0.606 |
| Tuned (GridSearch) ✅ | **79.45%** | **0.634** |
| SMOTE Balanced | 73.77% | 0.601 |
| Ensemble (LR+RF+SVM) | 78.71% | 0.630 |

**Best model: Tuned LinearSVC** with `C=0.1`, `class_weight='balanced'`

### TF-IDF Configuration (Best)

```
ngram_range  : (1, 3)   ← unigrams + bigrams + trigrams
max_features : 8,000
min_df       : 3
max_df       : 0.90
sublinear_tf : True     ← log-scaled term frequency
```

### Per-Class F1 (Best Model)

| Class | Precision | Recall | F1 |
|---|---|---|---|
| Negative | ~0.62 | ~0.63 | ~0.62 |
| Neutral | ~0.39 | ~0.38 | ~0.39 |
| Positive | ~0.89 | ~0.89 | ~0.89 |

> Neutral is the hardest class — ambiguous by definition. Planned improvement: ParsBERT fine-tuning.

---

## Backend API

Built with **FastAPI + Uvicorn**, backed by **SQLite via SQLAlchemy async**.

### Database Tables

| Table | Purpose |
|---|---|
| `prediction_history` | Stores every comment the user submits for analysis |
| `product_summaries` | Cached sentiment summaries per product (computed on first request) |

### All Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root health check |
| `GET` | `/health` | Service status |
| **Sentiment** | | |
| `POST` | `/sentiment/predict` | Predict single comment + auto-save to history |
| `POST` | `/sentiment/predict-batch` | Predict up to 100 comments at once |
| **History** | | |
| `GET` | `/history` | Paginated prediction history (filterable by sentiment) |
| `GET` | `/history/stats` | Total counts & percentages per sentiment class |
| `GET` | `/history/{id}` | Single prediction detail |
| `DELETE` | `/history/{id}` | Delete a prediction from history |
| **Products** | | |
| `GET` | `/products/search?q=...` | Search products by name, brand, or category |
| `GET` | `/products/{id}` | Product info + sentiment breakdown + AI summary |
| `GET` | `/products/{id}/comments` | Paginated comments with sentiment labels |

### Interactive Docs

Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Installation

### Prerequisites

- Python 3.10
- Git

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/ArefOrumiehei/digikala-prods-comments-analysis.git
cd digikala-prods-comments-analysis

# 2. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# 3. Install dependencies
cd backend
pip install -r requirements_api.txt

# 4. Make sure model files exist at:
#    src/models/final_best_model.pkl
#    src/models/final_tfidf_vectorizer.pkl
```

### `requirements_api.txt`

```txt
fastapi
uvicorn[standard]
sqlalchemy
aiosqlite
scikit-learn
joblib
hazm
numpy
pandas
pydantic
python-dotenv
imbalanced-learn
```

---

## Running the Project

### Start the API

```bash
cd backend
python -m uvicorn api.main:app --reload --port 8000
```

The SQLite database (`digikala.db`) is created automatically on first run.

### Run the ML Notebook

Open `notebooks/comments_sentiment_analysis.ipynb` in Jupyter and run cells top to bottom. Cells 1–5 prepare the data; Cell 6 trains the baseline; Cell 8 produces the final saved model.

---

## API Reference

### `POST /sentiment/predict`

Predict sentiment for a single Persian comment. Result is automatically saved to history.

**Request:**
```json
{
  "text": "محصول عالی بود حتما پیشنهاد می کنم"
}
```

**Response:**
```json
{
  "sentiment": "positive",
  "confidence": 0.7229,
  "cleaned_text": "محصول عالی بود حتما پیشنهاد می کنم"
}
```

> `confidence` is a sigmoid-normalised decision function score (0.0–1.0).

---

### `POST /sentiment/predict-batch`

Predict sentiment for multiple comments (max 100). Not saved to history.

**Request:**
```json
{
  "texts": ["کیفیت خوبی داشت", "اصلاً راضی نبودم", "معمولی بود"]
}
```

**Response:**
```json
{
  "results": [
    {"sentiment": "positive", "confidence": 0.81, "cleaned_text": "..."},
    {"sentiment": "negative", "confidence": 0.74, "cleaned_text": "..."},
    {"sentiment": "neutral",  "confidence": 0.52, "cleaned_text": "..."}
  ]
}
```

---

### `GET /history?page=1&size=10&sentiment=positive`

**Response:**
```json
{
  "total": 47,
  "page": 1,
  "size": 10,
  "results": [
    {
      "id": 12,
      "input_text": "عالی بود",
      "cleaned_text": "عالی بود",
      "sentiment": "positive",
      "confidence": 0.84,
      "created_at": "2025-01-15T10:30:00"
    }
  ]
}
```

---

### `GET /history/stats`

**Response:**
```json
{
  "total": 47,
  "positive_count": 30,
  "neutral_count": 10,
  "negative_count": 7,
  "positive_pct": 63.83,
  "neutral_pct": 21.28,
  "negative_pct": 14.89
}
```

---

### `GET /products/{product_id}`

Returns product info, sentiment breakdown, and an extractive summary of comment bodies. Cached in DB after first request.

**Response:**
```json
{
  "product_id": 12345,
  "title": "گوشی موبایل سامسونگ",
  "category": "موبایل",
  "brand": "Samsung",
  "avg_rate": 4.2,
  "total_comments": 320,
  "positive_count": 210,
  "neutral_count": 70,
  "negative_count": 40,
  "positive_pct": 65.62,
  "neutral_pct": 21.88,
  "negative_pct": 12.5,
  "ai_summary": "دوربین عالی داره | باتری خوبیه | قیمتش مناسبه | ...",
  "last_updated": "2025-01-15T10:30:00"
}
```

---

### `GET /products/{product_id}/comments?page=1&size=10&sentiment=positive`

**Response:**
```json
{
  "product_id": 12345,
  "total": 210,
  "page": 1,
  "size": 10,
  "comments": [
    {
      "id": 9981,
      "body": "دوربینش واقعاً عالیه",
      "sentiment": "positive",
      "confidence": 0.91,
      "rate": 5.0,
      "created_at": "۱۵ دی ۱۴۰۲"
    }
  ]
}
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.10 |
| NLP | Hazm (Persian), Scikit-learn TF-IDF |
| ML | Scikit-learn (LinearSVC, LogisticRegression, RandomForest) |
| Oversampling | imbalanced-learn (SMOTE) |
| Summarization | TF-IDF extractive (no external API) |
| API | FastAPI + Uvicorn |
| Database | SQLite + SQLAlchemy (async) |
| Data | Pandas, NumPy |
| Visualisation | Matplotlib, Seaborn |
| Serialisation | Joblib, Pickle |

---

## Roadmap

- [x] Data pipeline & feature engineering
- [x] Persian text preprocessing (Hazm)
- [x] Multi-model training & comparison
- [x] Model improvement (GridSearch, SMOTE, Ensemble)
- [x] FastAPI backend with predict & batch endpoints
- [x] SQLite database with prediction history
- [x] Product sentiment summary API with caching
- [x] Extractive comment summarization (TF-IDF, no external API)
- [x] Paginated comment listing with sentiment filter
- [ ] Frontend web app (React)
- [ ] Product recommendation based on user comment sentiment
- [ ] ParsBERT fine-tuning for >85% accuracy
- [ ] Scale to full 6M records (chunked processing or PostgreSQL)
- [ ] Docker containerisation
- [ ] CI/CD pipeline

---

## Notes

- Development uses a **100k–200k row sample** for speed. Remove `nrows` limits in Cell 1 to train on the full dataset.
- The SQLite DB (`digikala_comments_setiment.db`) is auto-created at `backend/digikala_comments_setiment.db` on first startup.
- Product summaries are computed on first request and cached in DB — subsequent requests are instant.
- The neutral class has the lowest F1 (~0.39). Planned fix: fine-tune ParsBERT or tighten the neutral label definition.
