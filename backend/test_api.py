import requests

# 测试根路径
try:
    response = requests.get('http://localhost:8000/')
    print('根路径测试:', response.status_code, response.json())
except Exception as e:
    print('根路径测试失败:', str(e))

# 测试旅游规划API
try:
    test_data = {
        "user_type": "大学生特种兵游",
        "city": "北京",
        "preferences": ["历史人文景观"],
        "budget": 2000,
        "days": 3
    }
    response = requests.post('http://localhost:8000/api/travel/plan', json=test_data)
    print('旅游规划API测试:', response.status_code, response.json())
except Exception as e:
    print('旅游规划API测试失败:', str(e))
