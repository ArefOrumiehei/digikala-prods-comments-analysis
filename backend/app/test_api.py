import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    response = requests.get(f"{BASE_URL}/health")
    print("=== Health Check ===")
    print(json.dumps(response.json(), ensure_ascii=False, indent=2))
    print()

def test_single_predict():
    data = {
        "text": "این محصول واقعا عالی بود، خیلی راضی هستم",
        "rating": 5.0,
        "helpful_count": 10,
        "product_popularity": 100.0
    }
    
    response = requests.post(f"{BASE_URL}/predict", json=data)
    print("=== Single Prediction ===")
    print(json.dumps(response.json(), ensure_ascii=False, indent=2))
    print()

def test_batch_predict():
    data = {
        "items": [
            {
                "text": "خیلی خوب بود",
                "rating": 5.0,
                "helpful_count": 5
            },
            {
                "text": "معمولی بود",
                "rating": 3.0,
                "helpful_count": 2
            },
            {
                "text": "بد بود، اصلا خوب نبود",
                "rating": 1.0,
                "helpful_count": 8
            }
        ]
    }
    
    response = requests.post(f"{BASE_URL}/predict_batch", json=data)
    print("=== Batch Prediction ===")
    print(json.dumps(response.json(), ensure_ascii=False, indent=2))
    print()

def test_text_only():
    data = {"text": "این محصول خوب بود"}
    
    response = requests.post(f"{BASE_URL}/predict", json=data)
    print("=== Text Only ===")
    print(json.dumps(response.json(), ensure_ascii=False, indent=2))
    print()

if __name__ == "__main__":
    test_health()
    test_single_predict()
    test_text_only()
    test_batch_predict()
