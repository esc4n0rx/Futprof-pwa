
import json
import sys

try:
    with open('data/base.json', 'r', encoding='utf-8') as f:
        json.load(f)
    print("JSON is valid")
except json.JSONDecodeError as e:
    print(f"JSON Error: {e}")
    print(f"Line: {e.lineno}, Column: {e.colno}")
except Exception as e:
    print(f"Error: {e}")
