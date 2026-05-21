import joblib
import math
import re
import numpy as np
from pathlib import Path
from hazm import Normalizer, word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer as SummaryTfidf

# ── Paths ─────────────────────────────────────────────────────
# backend/api/predictor.py → .parent = api → .parent = backend → .parent = root
BASE_DIR   = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "src" / "models"

# ── Load model artefacts once at startup ──────────────────────
model      = joblib.load(MODELS_DIR / "final_best_model.pkl")
vectorizer = joblib.load(MODELS_DIR / "final_tfidf_vectorizer.pkl")
normalizer = Normalizer()

print(f"✓ Model loaded from: {MODELS_DIR}")


# ── Persian text preprocessor ─────────────────────────────────
def preprocess(text: str) -> str:
    """
    Clean and normalise a Persian comment for model inference.
    Must match the preprocessing used during training exactly.
    """
    if not text or str(text).strip() == "":
        return ""

    text = normalizer.normalize(str(text))
    text = re.sub(r'[a-zA-Z0-9]+', ' ', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    tokens = word_tokenize(text)
    tokens = [w for w in tokens if len(w) > 1]
    return ' '.join(tokens)


# ── Sigmoid helper ────────────────────────────────────────────
def sigmoid(x: float) -> float:
    """
    Converts LinearSVC decision function score to a 0–1 range.
    Not a true probability but a useful confidence proxy.
    """
    return 1 / (1 + math.exp(-x))


# ── Single prediction ─────────────────────────────────────────
def predict(text: str) -> dict:
    """
    Preprocess text, vectorise, predict sentiment, return result dict.

    Returns:
        {
            "sentiment":    "positive" | "neutral" | "negative",
            "confidence":   float 0.0–1.0  (sigmoid of decision score),
            "cleaned_text": str
        }
    """
    cleaned    = preprocess(text)
    vectorized = vectorizer.transform([cleaned])
    label      = model.predict(vectorized)[0]

    # LinearSVC returns decision_function scores (not probabilities)
    scores     = model.decision_function(vectorized)[0]
    confidence = round(sigmoid(float(max(scores))), 4)

    return {
        "sentiment":    label,
        "confidence":   confidence,
        "cleaned_text": cleaned
    }


# ── Extractive summarizer ─────────────────────────────────────
def summarize_comments(comments: list[str], top_n: int = 5) -> str:
    """
    Extractive summarization using TF-IDF sentence scoring.

    Picks the top_n most informative comment bodies from the list
    by scoring each comment with TF-IDF and selecting those with
    the highest total term weight.

    Args:
        comments: List of raw comment body strings
        top_n:    Number of top comments to include in summary

    Returns:
        A string of top comments joined by " | "
        Returns "" if comments list is empty.
    """
    # Filter out empty/null comments
    comments = [c for c in comments if c and str(c).strip()]

    if not comments:
        return ""

    # If fewer comments than top_n, return all of them
    if len(comments) <= top_n:
        return " | ".join(comments)

    # Preprocess all comments before scoring
    cleaned_comments = [preprocess(c) for c in comments]
    cleaned_comments = [c for c in cleaned_comments if c]

    if not cleaned_comments:
        return " | ".join(comments[:top_n])

    # Score each comment by total TF-IDF weight
    # Higher score = comment uses more distinctive/informative vocabulary
    tfidf  = SummaryTfidf(max_features=1000)
    matrix = tfidf.fit_transform(cleaned_comments)
    scores = np.asarray(matrix.sum(axis=1)).flatten()

    # Get indices of top N scoring comments (descending order)
    top_indices  = scores.argsort()[-top_n:][::-1]

    # Return original (non-cleaned) text for readability
    top_comments = [comments[i] for i in top_indices if i < len(comments)]

    return " | ".join(top_comments)