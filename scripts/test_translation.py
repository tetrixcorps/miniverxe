import requests
import json
import base64
import argparse

class MLServiceTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url

    def test_health(self):
        """Test health endpoint"""
        response = requests.get(f"{self.base_url}/health")
        print("Health Check:", response.json())
        return response.status_code == 200

    def test_text_translation(self, text, target_lang, source_lang=None):
        """Test text translation"""
        payload = {
            "text": text,
            "target_lang": target_lang,
            "source_lang": source_lang,
            "optimize": False
        }
        
        response = requests.post(
            f"{self.base_url}/translate",
            json=payload
        )
        print("\nText Translation Result:")
        print(json.dumps(response.json(), indent=2))
        return response.json()

    def test_model_optimization(self):
        """Test model optimization"""
        response = requests.post(f"{self.base_url}/optimize_model")
        print("\nModel Optimization Result:")
        print(json.dumps(response.json(), indent=2))
        return response.json()

def main():
    parser = argparse.ArgumentParser(description='Test ML Translation Service')
    parser.add_argument('--text', default="Hello, how are you?", help='Text to translate')
    parser.add_argument('--target', default="fra", help='Target language code')
    parser.add_argument('--source', default=None, help='Source language code')
    
    args = parser.parse_args()
    
    tester = MLServiceTester()
    
    # Run tests
    if tester.test_health():
        print("\n✅ Service is healthy")
        tester.test_text_translation(args.text, args.target, args.source)
        tester.test_model_optimization()
    else:
        print("\n❌ Service is not responding")

if __name__ == "__main__":
    main() 