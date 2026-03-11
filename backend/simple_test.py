import requests
import json

url = 'http://localhost:8000/api/travel/plan'
headers = {'Content-Type': 'application/json'}
data = {
    "user_type": "大学生特种兵游",
    "city": "北京",
    "preferences": ["自然风光", "历史人文景观"],
    "budget": 2000,
    "days": 3
}

try:
    response = requests.post(url, headers=headers, json=data, timeout=60)
    print('Status Code:', response.status_code)
    print('Response:', response.text)
except Exception as e:
    print('Error:', str(e))