import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from scipy.sparse import hstack, csr_matrix
import os
import re
from hazm import Normalizer, word_tokenize

class SentimentAnalyzer:
    # Sentiment Analyzer
    def __init__(self, 
                  model_path='models/best_model_svm.pkl',
                  vectorizer_path='models/tfidf_vectorizer.pkl'):
        
        base_dir = Path(__file__).parent
        self.model_path = base_dir / model_path
        self.vectorizer_path = base_dir / vectorizer_path
        
        # Initialize normalizer
        self.normalizer = Normalizer()
        
        # Loading
        try:
            print(f"🔍 Looking for model at: {self.model_path.absolute()}")
            print(f"🔍 Looking for vectorizer at: {self.vectorizer_path.absolute()}")
            
            self.model = joblib.load(self.model_path)
            self.vectorizer = joblib.load(self.vectorizer_path)
            print(f"✓ Model loaded from {self.model_path}")
            print(f"✓ Vectorizer loaded from {self.vectorizer_path}")
        except FileNotFoundError as e:
            print(f"⚠ Warning: {e}")
            print(f"⚠ Current working directory: {os.getcwd()}")
            print(f"⚠ Model path attempted: {self.model_path.absolute()}")
            print("Model or Vectorizer did not found.")
            self.model = None
            self.vectorizer = None
        
        self.label_map = {0: 'negative', 1: 'neutral', 2: 'positive'}
    
    def preprocess_persian_text(self, text):
        """
        Preprocess Persian text:
        - Normalize
        - Remove extra spaces
        - Remove English characters and numbers
        - Tokenize
        - Remove stopwords
        - Remove short words (< 2 chars)
        """
        if pd.isna(text) or text == '':
            return ''
        
        # Normalize text
        text = self.normalizer.normalize(str(text))
        
        # Remove English characters and numbers
        text = re.sub(r'[a-zA-Z0-9]+', ' ', text)
        
        # Remove extra punctuation
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Remove extra spaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Note: stopword removal is commented out in original notebook
        # tokens = [word for word in tokens if word not in persian_stopwords and len(word) > 1]
        
        return ' '.join(tokens)
    
    def _prepare_features(self, text, rating=None, helpful_count=None, 
                        product_popularity=None):
        """
        Features Preparing
        """
        # Preprocess text first
        preprocessed_text = self.preprocess_persian_text(text)
        
        # Text features
        text_features = self.vectorizer.transform([preprocessed_text])
        
        # Numerical features
        numerical_features = []
        
        if rating is not None:
            numerical_features.append(rating)
        else:
            numerical_features.append(0.0)
        
        if helpful_count is not None:
            numerical_features.append(helpful_count)
        else:
            numerical_features.append(0.0)
        
        if product_popularity is not None:
            numerical_features.append(product_popularity)
        else:
            numerical_features.append(0.0)
        
        numerical_sparse = csr_matrix([numerical_features])
        combined_features = hstack([text_features, numerical_sparse])
        
        return combined_features, {
            'rating': rating,
            'helpful_count': helpful_count,
            'product_popularity': product_popularity
        }
    
    def predict(self, text, rating=None, helpful_count=None, 
                product_popularity=None):
        """
        Predict Sentiment
        
        Args:
            text: Comment Text
            rating: Rate (1-5)
            helpful_count: Like Count
            product_popularity: Product popularity
            
        Returns:
            dict with sentiment and confidence
        """
        if self.model is None or self.vectorizer is None:
            raise RuntimeError("Model or vectorizer not loaded")
        
        # Features Preparing
        X, features_used = self._prepare_features(
            text, rating, helpful_count, product_popularity
        )
        
        # Pridict
        pred = self.model.predict(X)[0]
        proba = self.model.predict_proba(X)[0]
        
        return {
            'text': text,
            'sentiment': self.label_map.get(pred, str(pred)),
            'confidence': {
                'negative': round(float(proba[0]), 4),
                'neutral': round(float(proba[1]), 4),
                'positive': round(float(proba[2]), 4)
            },
            'features_used': features_used
        }


# Test
if __name__ == "__main__":
    analyzer = SentimentAnalyzer()
    
    test_cases = [
        {
            'text': 'عالی بود، خیلی راضی هستم',
            'rating': 5.0,
            'helpful_count': 10
        },
        {
            'text': 'معمولی بود',
            'rating': 3.0,
            'helpful_count': 2
        },
        {
            'text': 'افتضاح بود، اصلا خوب نبود',
            'rating': 1.0,
            'helpful_count': 5
        }
    ]
    
    for case in test_cases:
        result = analyzer.predict(**case)
        print(f"\nText {result['text']}")
        print(f"Sentiment: {result['sentiment']}")
        print(f"Confidence: {result['confidence']}")
