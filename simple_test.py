import requests

url = 'http://localhost:8000/api/travel/plan'
headers = {'Content-Type': 'application/json'}
data = '''
{
    "user_type": "独自旅行",
    "city": "北京",
    "preferences": ["美食探店", "城市漫游"],
    "budget": 2000,
    "days": 2
}
'''

try:
    response = requests.post(url, headers=headers, data=data, timeout=60)
    print('Status Code:', response.status_code)
    print('Response:', response.text)
except Exception as e:
    print('Error:', str(e))