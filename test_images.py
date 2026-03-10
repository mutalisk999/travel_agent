import requests
import json

url = 'http://localhost:8000/api/travel/plan'
headers = {'Content-Type': 'application/json'}
data = {
    'user_type': '独自旅行',
    'city': '北京',
    'preferences': ['美食探店', '城市漫游'],
    'budget': 2000,
    'days': 2
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data), timeout=60)
    print('Status Code:', response.status_code)
    result = response.json()
    
    # 检查行程安排是否包含图片URL
    if result['itinerary']:
        for day in result['itinerary']:
            print(f'\n第{day["day"]}天：')
            print(f'活动：{day["activities"][:100]}...')  # 只显示前100个字符
            if 'images' in day and day['images']:
                print(f'图片URL：{day["images"]}')
            else:
                print('图片URL：无')
    else:
        print('无行程安排')
except Exception as e:
    print('Error:', str(e))