import requests
import json

url = 'http://localhost:8000/api/travel/plan'
headers = {'Content-Type': 'application/json'}
data = {
    "user_type": "大学生特种兵游",
    "city": "上海",
    "preferences": ["美食探店", "网红打卡"],
    "budget": 1000,
    "days": 2
}

response = requests.post(url, headers=headers, json=data)
print("Response status code:", response.status_code)
print("Response content:", response.json())