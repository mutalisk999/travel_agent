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
    print('Itinerary:', result['itinerary'])
    print('Hotels:', result['hotels'])
    print('Transportation:', result['transportation'])
    
    # 检查酒店数据是否包含名字
    if result['hotels'] and len(result['hotels']) > 0:
        for i, hotel in enumerate(result['hotels']):
            print(f'Hotel {i+1} Name:', hotel.get('name', 'No name'))
    else:
        print('No hotels found')
except Exception as e:
    print('Error:', str(e))