import requests
import json
import time

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

print(f"Testing API at: {url}")
print(f"Request data: {json.dumps(data, ensure_ascii=False)}")

# 发送POST请求
try:
    start_time = time.time()
    print(f"Sending request...")
    response = requests.post(url, json=data, timeout=120)
    end_time = time.time()
    print(f"Request took {end_time - start_time:.2f} seconds")
    print(f"Status code: {response.status_code}")
    
    try:
        result = response.json()
        print(f"\n--- 第一天的行程 ---")
        if 'itinerary' in result and len(result['itinerary']) > 0:
            day1 = result['itinerary'][0]
            print(f"第{day1['day']}天:")
            print(day1['activities'])
    except json.JSONDecodeError:
        print(f"Response content: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")
