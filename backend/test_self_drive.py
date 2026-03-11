import requests
import json
import time

# API端点
url = "http://localhost:8000/api/travel/plan"

# 测试自驾偏好
data_self_drive = {
    "user_type": "大学生特种兵游",
    "departure_city": "上海",
    "city": "杭州",
    "preferences": ["自驾环线", "自然风光"],
    "budget": 2000,
    "days": 2,
    "model": "KAT-Coder-Pro-V1"
}

# 测试非自驾偏好
data_public_transport = {
    "user_type": "大学生特种兵游",
    "departure_city": "上海",
    "city": "杭州",
    "preferences": ["自然风光"],
    "budget": 2000,
    "days": 2,
    "model": "KAT-Coder-Pro-V1"
}

print("=== 测试自驾偏好 ===")
print(f"Request data: {json.dumps(data_self_drive, ensure_ascii=False)}")

try:
    start_time = time.time()
    response = requests.post(url, json=data_self_drive, timeout=120)
    end_time = time.time()
    print(f"Request took {end_time - start_time:.2f} seconds")
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n--- 第一天的行程 ---")
        if 'itinerary' in result and len(result['itinerary']) > 0:
            day1 = result['itinerary'][0]
            print(f"第{day1['day']}天:")
            print(day1['activities'])
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")

print("\n\n=== 测试非自驾偏好 ===")
print(f"Request data: {json.dumps(data_public_transport, ensure_ascii=False)}")

try:
    start_time = time.time()
    response = requests.post(url, json=data_public_transport, timeout=120)
    end_time = time.time()
    print(f"Request took {end_time - start_time:.2f} seconds")
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n--- 第一天的行程 ---")
        if 'itinerary' in result and len(result['itinerary']) > 0:
            day1 = result['itinerary'][0]
            print(f"第{day1['day']}天:")
            print(day1['activities'])
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")
