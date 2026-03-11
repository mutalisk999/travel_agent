import requests
import json

# API端点
url = "http://localhost:8000/api/travel/plan"

# 请求数据
data = {
    "user_type": "大学生特种兵游",
    "departure_city": "上海",
    "city": "北京",
    "preferences": ["历史人文景观", "自然风光"],
    "budget": 3000,
    "days": 3,
    "model": "KAT-Coder-Pro-V1"
}

# 发送POST请求
try:
    response = requests.post(url, json=data, timeout=60)
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {str(e)}")
