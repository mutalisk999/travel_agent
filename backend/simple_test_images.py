import requests
import json

url = 'http://localhost:8000/api/travel/plan'
headers = {'Content-Type': 'application/json'}
data = {
    'user_type': '独自旅行',
    'city': '北京',
    'preferences': ['美食探店'],
    'budget': 1000,
    'days': 1
}

try:
    print('发送请求...')
    response = requests.post(url, headers=headers, data=json.dumps(data), timeout=30)
    print('Status Code:', response.status_code)
    result = response.json()
    print('Response received')
    
    # 检查行程安排是否包含图片URL
    if result['itinerary']:
        for day in result['itinerary']:
            print(f'\n第{day["day"]}天：')
            if 'images' in day and day['images']:
                print(f'图片URL数量：{len(day["images"])}')
                for i, image_url in enumerate(day['images']):
                    print(f'图片{i+1}：{image_url}')
            else:
                print('图片URL：无')
    else:
        print('无行程安排')
except Exception as e:
    print('Error:', str(e))
    import traceback
    traceback.print_exc()