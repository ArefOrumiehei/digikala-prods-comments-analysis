import os
import joblib
import math
import re
import numpy as np
from pathlib import Path
from hazm import Normalizer, word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer as SummaryTfidf
import json
from collections import OrderedDict
from openai import OpenAI
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler

load_dotenv()

# ── Paths ─────────────────────────────────────────────────────
# backend/api/predictor.py → .parent = api → .parent = backend → .parent = root
BASE_DIR   = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "src" / "models"

# Logging 
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

llm_logger = logging.getLogger("llm")
llm_logger.setLevel(logging.DEBUG)

# Console handler
_console_handler = logging.StreamHandler()
_console_handler.setLevel(logging.INFO)
_console_handler.setFormatter(logging.Formatter(
    "[%(asctime)s] [LLM] %(levelname)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
))

# File handler — rotates at 5MB, keeps 3 backups
_file_handler = RotatingFileHandler(
    LOG_DIR / "llm.log",
    maxBytes=5 * 1024 * 1024,
    backupCount=3,
    encoding="utf-8"
)
_file_handler.setLevel(logging.DEBUG)
_file_handler.setFormatter(logging.Formatter(
    "[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
))

llm_logger.addHandler(_console_handler)
llm_logger.addHandler(_file_handler)

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


_llm_client = OpenAI(
    base_url=os.getenv("LLM_BASE_URL", "https://api.gapgpt.app/v1"),
    api_key=os.getenv("LLM_API_KEY", ""),
)
_LLM_MODEL = os.getenv("LLM_MODEL", "qwen3-235b-a22b")

def summarize_comments(
    comments: list[str],
    max_comments: int = 15,
) -> dict:
    import time

    comments = [c.strip() for c in comments if c and str(c).strip()]

    if not comments:
        llm_logger.warning("summarize_comments called with empty comment list")
        return {"summary": "", "pros": [], "cons": [], "sentiment": "neutral"}

    comments = list(OrderedDict.fromkeys(comments))
    comments = comments[:max_comments]
    comments = [c[:200] for c in comments]

    comments_text = "\n".join(f"- {c}" for c in comments)

    prompt = f"""نظرات کاربران درباره یک محصول:

    {comments_text}
    
    کار شما:
    - یک خلاصه کوتاه از نظر کلی کاربران بنویس
    - نقاط قوت پرتکرار را استخراج کن
    - نقاط ضعف پرتکرار را استخراج کن
    - احساس کلی کاربران را مشخص کن
    
    فقط JSON معتبر برگردان. بدون هیچ متن اضافه.
    
    فرمت دقیق:
    {{
    "summary": "خلاصه کوتاه",
    "pros": ["نقطه قوت ۱", "نقطه قوت ۲"],
    "cons": ["نقطه ضعف ۱", "نقطه ضعف ۲"],
    "sentiment": "positive"
    }}
    
    قوانین:
    - فقط JSON برگردان، هیچ متن دیگری نه
    - sentiment فقط یکی از این سه مقدار: positive، negative، neutral"""
    
    # ── Log request ───────────────────────────────────────────
    llm_logger.info(f"REQUEST | model={_LLM_MODEL} | comments={len(comments)} | chars={len(comments_text)}")
    llm_logger.debug(f"REQUEST PROMPT:\n{prompt}")

    start_time = time.time()

    try:
        response = _llm_client.chat.completions.create(
            model=_LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=400,
        )

        elapsed = round(time.time() - start_time, 2)
        content = response.choices[0].message.content.strip()

        # ── Log response ──────────────────────────────────────
        usage = response.usage
        llm_logger.info(
            f"RESPONSE | elapsed={elapsed}s | "
            f"prompt_tokens={usage.prompt_tokens if usage else '?'} | "
            f"completion_tokens={usage.completion_tokens if usage else '?'} | "
            f"total_tokens={usage.total_tokens if usage else '?'}"
        )
        llm_logger.debug(f"RESPONSE RAW:\n{content}")

        # Strip markdown fences
        content = content.replace("```json", "").replace("```", "").strip()

        start = content.find("{")
        end   = content.rfind("}") + 1

        if start == -1 or end == 0:
            raise ValueError("No valid JSON found in LLM response")

        result = json.loads(content[start:end])

        sentiment = result.get("sentiment", "neutral")
        if sentiment not in ("positive", "negative", "neutral"):
            llm_logger.warning(f"Invalid sentiment value '{sentiment}' — defaulting to neutral")
            sentiment = "neutral"

        parsed = {
            "summary":   result.get("summary", ""),
            "pros":      result.get("pros", []) if isinstance(result.get("pros"), list) else [],
            "cons":      result.get("cons", []) if isinstance(result.get("cons"), list) else [],
            "sentiment": sentiment,
        }

        llm_logger.info(
            f"PARSED | sentiment={parsed['sentiment']} | "
            f"pros={len(parsed['pros'])} | cons={len(parsed['cons'])} | "
            f"summary_len={len(parsed['summary'])}"
        )

        return parsed

    except Exception as e:
        elapsed = round(time.time() - start_time, 2)
        llm_logger.error(f"FAILED | elapsed={elapsed}s | error={type(e).__name__}: {e}")
        return {"summary": "", "pros": [], "cons": [], "sentiment": "neutral"}