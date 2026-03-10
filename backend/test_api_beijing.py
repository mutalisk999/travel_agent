import requests
import json

url = 'http://localhost:8000/api/travel/plan'
headers = {'Content-Type': 'application/json'}
data = {
    "user_type": "单身社交游",
    "city": "北京",
    "preferences": ["休闲度假", "民俗风土人情", "网红打卡"],
    "budget": 1000,
    "days": 3
}

response = requests.post(url, headers=headers, json=data)
print("Response status code:", response.status_code)
print("Response content:", response.json())