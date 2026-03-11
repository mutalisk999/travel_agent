from typing import Dict, List, Any
import requests
import re
import os
from dotenv import load_dotenv
from enum import Enum

# 加载环境变量
load_dotenv()


class LLMModel(Enum):
    GLM_5 = "GLM-5"
    GLM_4_7 = "GLM-4.7"
    GLM_4_6 = "GLM-4.6"
    GLM_4_5 = "GLM-4.5"
    GLM_4_5V = "GLM-4.5V"

    Kimi_K2_Instruct = "Kimi-K2-Instruct"

    MiniMax_M2_5 = "MiniMax-M2.5"

    KAT_Coder_Pro_V1 = "KAT-Coder-Pro-V1"
    KAT_Coder_Exp_72B_1010 = "KAT-Coder-Exp-72B-1010"

    DeepSeek_V3 = "DeepSeek-V3"
    DeepSeek_V3_2 = "DeepSeek-V3.2"
    DeepSeek_V3_2_EXP = "DeepSeek-V3.2-EXP"
    DeepSeek_R1_0528 = "DeepSeek-R1-0528"
    DeepSeek_R1_0528_Qwen3_8B = "DeepSeek-R1-0528-Qwen3-8B"
    DeepSeek_R1_Distill_Qwen_14B = "DeepSeek-R1-Distill-Qwen-14B"

    Qwen3_Next_80B_A3B_Instruct = "Qwen3-Next-80B-A3B-Instruct"
    Qwen3_Next_80B_A3B_Thinking = "Qwen3-Next-80B-A3B-Thinking"
    Qwen3_Coder_480B_A35B_Instruct = "Qwen3-Coder-480B-A35B-Instruct"
    Qwen3_235B_A22B_2507 = "Qwen3-235B-A22B-2507"
    Qwen3_235B_A22B = "Qwen3-235B-A22B"
    Qwen3_32B_FP8 = "Qwen3-32B-FP8"
    Qwen3_30B_A3B_FP8 = "Qwen3-30B-A3B-FP8"

    Qwen2_5_72B_Instruct = "Qwen2.5-72B-Instruct"
    Qwen2_5_72B_Instruct_128K = "Qwen2.5-72B-Instruct-128K"


class TravelAgent:
    def __init__(self, model: LLMModel = LLMModel.DeepSeek_R1_0528_Qwen3_8B):
        self.api_url = "https://api.edgefn.net/v1/chat/completions"
        self.api_key = os.getenv("API_KEY", "")
        self.model = model.value

    def _call_llm(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
        }
        response = requests.post(self.api_url, headers=headers, json=data, timeout=300)
        return response.json()["choices"][0]["message"]["content"]

    def _parse_daily_itinerary(self, text: str, days: int) -> List[str]:
        """解析每日行程文本"""
        daily_itineraries = []

        for day_num in range(1, days + 1):
            patterns = [
                rf"第{day_num}天[：:]?\s*(.+?)(?=(?:第{day_num + 1}天)|$)",
                rf"第{day_num}天[：:]?\s*(.+?)(?=(?:第\d+天)|$)",
                rf"(?:^|\n)\s*第{day_num}天[：:]?\s*(.+?)(?=(?:\n\s*第\d+天)|$)",
                rf"(?:^|\n)\s*D{day_num}[：:]?\s*(.+?)(?=(?:D{day_num + 1})|$)",
                rf"(?:^|\n)\s*Day {day_num}[：:]?\s*(.+?)(?=(?:Day {day_num + 1})|$)",
            ]

            for pattern in patterns:
                match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
                if match:
                    content = match.group(1).strip()
                    if content:
                        # 清理markdown符号
                        content = re.sub(r'\*\*', '', content)
                        daily_itineraries.append(content)
                        break

        # 如果没有找到任何行程，尝试使用整个文本作为第一天的行程
        if not daily_itineraries and text.strip():
            content = text.strip()
            # 清理markdown符号
            content = re.sub(r'\*\*', '', content)
            daily_itineraries.append(content)

        if len(daily_itineraries) < days:
            daily_itineraries.extend([""] * (days - len(daily_itineraries)))

        return daily_itineraries[:days]

    def _parse_hotels(self, hotels_text: str) -> List[Dict[str, str]]:
        """解析酒店推荐文本为结构化数据"""
        hotels = []
        
        # 按酒店分隔文本
        hotel_blocks = re.split(r'酒店名称：', hotels_text)
        
        # 跳过第一个空块
        for block in hotel_blocks[1:]:
            if not block.strip():
                continue
                
            # 提取酒店信息
            name = self._extract_field(block, [r'(.*?)(?:\n|$)'])
            location = self._extract_field(block, [r'位置：\s*(.+?)(?:\n|$)'])
            price = self._extract_field(block, [r'价格：\s*(.+?)(?:\n|$)'])
            features = self._extract_field(block, [r'特色：\s*(.+?)(?:\n|$)'])
            reason = self._extract_field(block, [r'推荐理由：\s*(.+?)(?:\n|$)'])
            
            hotel = {
                "name": name,
                "location": location,
                "price": price,
                "features": features,
                "reason": reason
            }

            if not hotel["name"]:
                hotel["name"] = (
                    block.strip()[:30] + "..."
                    if len(block.strip()) > 30
                    else block.strip()
                )

            hotels.append(hotel)

        if not hotels:
            # 尝试使用旧格式解析
            hotel_blocks = re.split(
                r"\n\s*(?=(?:\d+[\.、]|酒店\s*\d+|【|\*\s*))", hotels_text
            )

            for block in hotel_blocks:
                if not block.strip():
                    continue

                hotel = {
                    "name": self._extract_field(
                        block,
                        [
                            r"酒店名称[：:]\s*(.+?)(?:\n|$)",
                            r"(?:^|\n)\s*(?:\d+[\.、])?\s*([^\n]+?酒店[^\n]*)",
                            r"(?:^|\n)\s*(?:\d+[\.、])?\s*([^\n]{2,20})(?:\n|$)",
                        ],
                    ),
                    "location": self._extract_field(
                        block,
                        [
                            r"位置[：:]\s*(.+?)(?:\n|$)",
                            r"酒店位置[：:]\s*(.+?)(?:\n|$)",
                            r"靠近[：:]?\s*(.+?)(?:\n|$)",
                        ],
                    ),
                    "price": self._extract_field(
                        block,
                        [
                            r"价格[：:]\s*(.+?)(?:\n|$)",
                            r"价格区间[：:]\s*(.+?)(?:\n|$)",
                            r"(?:\d{3,4}[-~]\d{3,4}|\d{3,4}元)",
                        ],
                    ),
                    "features": self._extract_field(
                        block,
                        [r"特色[：:]\s*(.+?)(?:\n|$)", r"酒店特色[：:]\s*(.+?)(?:\n|$)"],
                    ),
                    "reason": self._extract_field(
                        block,
                        [r"推荐理由[：:]\s*(.+?)(?:\n|$)", r"推荐[：:]\s*(.+?)(?:\n|$)"],
                    ),
                }

                if not hotel["name"]:
                    hotel["name"] = (
                        block.strip()[:30] + "..."
                        if len(block.strip()) > 30
                        else block.strip()
                    )

                hotels.append(hotel)

        if not hotels:
            hotels.append(
                {
                    "name": "酒店推荐",
                    "location": "根据行程区域选择",
                    "price": "根据预算选择",
                    "features": "多种选择",
                    "reason": "建议提前预订，选择交通便利的酒店",
                }
            )

        return hotels[:5]

    def _extract_field(self, text: str, patterns: List[str]) -> str:
        """使用多个正则模式提取字段"""
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return (
                    match.group(1).strip() if match.groups() else match.group(0).strip()
                )
        return ""

    def _parse_transportation(self, transport_text: str) -> Dict[str, str]:
        """解析交通建议文本为结构化数据"""
        # 尝试使用新格式解析
        to_city = self._extract_field(transport_text, [r'到达城市：\s*(.+?)(?:\n|$)'])
        in_city = self._extract_field(transport_text, [r'城市内交通：\s*(.+?)(?:\n|$)'])
        between_attractions = self._extract_field(transport_text, [r'景点间交通：\s*(.+?)(?:\n|$)'])
        cost_estimate = self._extract_field(transport_text, [r'费用估算：\s*(.+?)(?:\n|$)'])
        
        # 如果新格式解析失败，尝试使用旧格式
        if not to_city:
            to_city = self._extract_field(
                transport_text,
                [
                    r"到达.*?交通[：:]\s*(.+?)(?:\n|$)",
                    r"到达.*?方式[：:]\s*(.+?)(?:\n|$)",
                    r"(?:飞机|高铁|火车|自驾).*?(?:\n|$)",
                ],
            ) or "详见下方建议"
        
        if not in_city:
            in_city = self._extract_field(
                transport_text,
                [
                    r"城市内.*?交通[：:]\s*(.+?)(?:\n|$)",
                    r"市内.*?交通[：:]\s*(.+?)(?:\n|$)",
                    r"(?:地铁|公交|打车|出租车).*?(?:\n|$)",
                ],
            ) or "详见下方建议"
        
        if not between_attractions:
            between_attractions = self._extract_field(
                transport_text,
                [
                    r"景点.*?交通[：:]\s*(.+?)(?:\n|$)",
                    r"各景点.*?交通[：:]\s*(.+?)(?:\n|$)",
                ],
            ) or "详见下方建议"
        
        if not cost_estimate:
            cost_estimate = self._extract_field(
                transport_text,
                [
                    r"费用估算[：:]\s*(.+?)(?:\n|$)",
                    r"交通费用[：:]\s*(.+?)(?:\n|$)",
                    r"(?:约|大约)?\s*\d+\s*元",
                ],
            ) or "根据实际选择"
        
        return {
            "to_city": to_city,
            "in_city": in_city,
            "between_attractions": between_attractions,
            "cost_estimate": cost_estimate,
        }

    def _generate_image_urls(self, attractions: List[str]) -> List[str]:
        """为景点生成图片URL"""
        image_urls = []
        # 为每个景点提供多个图片URL，这些图片来自网络
        attraction_images = {
            '外滩': [
                'https://img.freepik.com/free-photo/shanghai-bund-skyline-at-night_1127-3282.jpg',
                'https://img.freepik.com/free-photo/shanghai-bund-daytime_1127-3379.jpg',
                'https://img.freepik.com/free-photo/shanghai-bund-historical-buildings_1127-3380.jpg'
            ],
            '南京路步行街': [
                'https://img.freepik.com/free-photo/nanjing-road-shanghai-china_1127-3355.jpg',
                'https://img.freepik.com/free-photo/nanjing-road-shopping_1127-3381.jpg',
                'https://img.freepik.com/free-photo/nanjing-road-night_1127-3382.jpg'
            ],
            '豫园': [
                'https://img.freepik.com/free-photo/yuyuan-garden-shanghai_1127-3368.jpg',
                'https://img.freepik.com/free-photo/yuyuan-garden-traditional_1127-3383.jpg',
                'https://img.freepik.com/free-photo/yuyuan-garden-pavilion_1127-3384.jpg'
            ],
            '人民广场': [
                'https://img.freepik.com/free-photo/people-square-shanghai_1127-3367.jpg',
                'https://img.freepik.com/free-photo/people-square-music-hall_1127-3385.jpg',
                'https://img.freepik.com/free-photo/people-square-fountain_1127-3386.jpg'
            ],
            '陆家嘴': [
                'https://img.freepik.com/free-photo/shanghai-lujiazui-financial-district_1127-3369.jpg',
                'https://img.freepik.com/free-photo/shanghai-lujiazui-skyline_1127-3387.jpg',
                'https://img.freepik.com/free-photo/shanghai-lujiazui-night_1127-3388.jpg'
            ],
            '东方明珠': [
                'https://img.freepik.com/free-photo/oriental-pearl-tower-shanghai_1127-3366.jpg',
                'https://img.freepik.com/free-photo/oriental-pearl-tower-night_1127-3389.jpg',
                'https://img.freepik.com/free-photo/oriental-pearl-tower-upclose_1127-3390.jpg'
            ],
            '故宫': [
                'https://img.freepik.com/free-photo/forbidden-city-beijing_1127-3370.jpg',
                'https://img.freepik.com/free-photo/forbidden-city-summer_1127-3391.jpg',
                'https://img.freepik.com/free-photo/forbidden-city-treasure_1127-3392.jpg'
            ],
            '天安门': [
                'https://img.freepik.com/free-photo/tiananmen-square-beijing_1127-3371.jpg',
                'https://img.freepik.com/free-photo/tiananmen-flag-raising_1127-3393.jpg',
                'https://img.freepik.com/free-photo/tiananmen-night_1127-3394.jpg'
            ],
            '长城': [
                'https://img.freepik.com/free-photo/great-wall-china_1127-3372.jpg',
                'https://img.freepik.com/free-photo/great-wall-mountain_1127-3395.jpg',
                'https://img.freepik.com/free-photo/great-wall-sunset_1127-3396.jpg'
            ],
            '颐和园': [
                'https://img.freepik.com/free-photo/summer-palace-beijing_1127-3373.jpg',
                'https://img.freepik.com/free-photo/summer-palace-lake_1127-3397.jpg',
                'https://img.freepik.com/free-photo/summer-palace-bridge_1127-3398.jpg'
            ],
            '广州塔': [
                'https://img.freepik.com/free-photo/canton-tower-guangzhou_1127-3374.jpg',
                'https://img.freepik.com/free-photo/canton-tower-night_1127-3399.jpg',
                'https://img.freepik.com/free-photo/canton-tower-river_1127-3400.jpg'
            ],
            '陈家祠': [
                'https://img.freepik.com/free-photo/chen-family-temple-guangzhou_1127-3375.jpg',
                'https://img.freepik.com/free-photo/chen-family-temple-details_1127-3401.jpg',
                'https://img.freepik.com/free-photo/chen-family-temple-courtyard_1127-3402.jpg'
            ],
            '世界之窗': [
                'https://img.freepik.com/free-photo/window-world-shenzhen_1127-3376.jpg',
                'https://img.freepik.com/free-photo/window-world-landmarks_1127-3403.jpg',
                'https://img.freepik.com/free-photo/window-world-night_1127-3404.jpg'
            ],
            '欢乐谷': [
                'https://img.freepik.com/free-photo/happy-valley-shenzhen_1127-3377.jpg',
                'https://img.freepik.com/free-photo/happy-valley-rides_1127-3405.jpg',
                'https://img.freepik.com/free-photo/happy-valley-parade_1127-3406.jpg'
            ],
            '田子坊': [
                'https://img.freepik.com/free-photo/tianzifang-shanghai_1127-3407.jpg',
                'https://img.freepik.com/free-photo/tianzifang-alley_1127-3408.jpg',
                'https://img.freepik.com/free-photo/tianzifang-shops_1127-3409.jpg'
            ],
            '新天地': [
                'https://img.freepik.com/free-photo/xintiandi-shanghai_1127-3410.jpg',
                'https://img.freepik.com/free-photo/xintiandi-bund_1127-3411.jpg',
                'https://img.freepik.com/free-photo/xintiandi-night_1127-3412.jpg'
            ],
            '上海科技馆': [
                'https://img.freepik.com/free-photo/shanghai-science-museum_1127-3413.jpg',
                'https://img.freepik.com/free-photo/shanghai-science-museum-exhibition_1127-3414.jpg',
                'https://img.freepik.com/free-photo/shanghai-science-museum-planetarium_1127-3415.jpg'
            ],
            '南锣鼓巷': [
                'https://img.freepik.com/free-photo/nanluoguxiang-beijing_1127-3416.jpg',
                'https://img.freepik.com/free-photo/nanluoguxiang-hutong_1127-3417.jpg',
                'https://img.freepik.com/free-photo/nanluoguxiang-shops_1127-3418.jpg'
            ],
            '什刹海': [
                'https://img.freepik.com/free-photo/shichahai-beijing_1127-3419.jpg',
                'https://img.freepik.com/free-photo/shichahai-lake_1127-3420.jpg',
                'https://img.freepik.com/free-photo/shichahai-winter_1127-3421.jpg'
            ],
            '798艺术区': [
                'https://img.freepik.com/free-photo/798-art-district-beijing_1127-3422.jpg',
                'https://img.freepik.com/free-photo/798-art-galleries_1127-3423.jpg',
                'https://img.freepik.com/free-photo/798-art-statues_1127-3424.jpg'
            ]
        }
        
        import random
        for attraction in attractions:
            # 查找景点对应的图片URL列表
            if attraction in attraction_images:
                # 随机选择一张图片
                image_url = random.choice(attraction_images[attraction])
                image_urls.append(image_url)
            else:
                # 如果没有对应的图片，使用默认图片
                default_images = [
                    'https://img.freepik.com/free-photo/tourist-attraction_1127-3378.jpg',
                    'https://img.freepik.com/free-photo/travel-destination_1127-3425.jpg',
                    'https://img.freepik.com/free-photo/landscape-view_1127-3426.jpg'
                ]
                image_url = random.choice(default_images)
                image_urls.append(image_url)
        return image_urls[:2]  # 每个景点最多返回2张图片

    def _extract_attractions(self, day_text: str) -> List[str]:
        """从每日行程中提取景点名称"""
        # 从文本中提取景点
        attractions = []
        
        # 直接从文本中提取明确的景点名称
        # 常见的上海景点
        shanghai_attractions = [
            '外滩', '南京路步行街', '豫园', '人民广场', '陆家嘴', '东方明珠',
            '上海博物馆', '上海科技馆', '田子坊', '新天地', '静安寺',
            '虹口公园', '外白渡桥', '西岸艺术中心', '世纪大道', '沉香阁'
        ]
        
        # 常见的北京景点
        beijing_attractions = [
            '故宫', '天安门', '长城', '颐和园', '圆明园', '天坛', '地坛',
            '北海公园', '景山公园', '恭王府', '雍和宫', '孔庙', '国子监',
            '八达岭长城', '慕田峪长城', '明十三陵', '798艺术区', '南锣鼓巷',
            '什刹海', '王府井', '西单', '三里屯', '奥林匹克公园', '鸟巢', '水立方'
        ]
        
        # 常见的广州景点
        guangzhou_attractions = [
            '广州塔', '陈家祠', '沙面岛', '上下九步行街', '北京路步行街',
            '白云山', '越秀公园', '中山纪念堂', '黄埔军校旧址', '长隆欢乐世界'
        ]
        
        # 常见的深圳景点
        shenzhen_attractions = [
            '世界之窗', '欢乐谷', '东部华侨城', '深圳湾公园', '红树林',
            '莲花山公园', '地王大厦', '京基100', '大鹏半岛', '西冲海滩'
        ]
        
        # 合并所有常见景点
        common_attractions = shanghai_attractions + beijing_attractions + guangzhou_attractions + shenzhen_attractions
        
        # 从文本中查找常见景点
        for attraction in common_attractions:
            if attraction in day_text:
                attractions.append(attraction)
        
        # 如果没有找到常见景点，尝试使用正则表达式提取
        if not attractions:
            # 优先提取明确的景点名称格式
            patterns = [
                r'【(.+?)】',  # 中文括号中的景点
                r'\*\*(.+?)\*\*',  # 加粗的景点
                r'前往(.+?)(?:，|。|\n|$)',  # 前往后面的景点，直到标点或结束
                r'游览(.+?)(?:，|。|\n|$)',  # 游览后面的景点，直到标点或结束
                r'参观(.+?)(?:，|。|\n|$)',  # 参观后面的景点，直到标点或结束
                r'打卡(.+?)(?:，|。|\n|$)',  # 打卡后面的景点，直到标点或结束
                r'游玩(.+?)(?:，|。|\n|$)',  # 游玩后面的景点，直到标点或结束
                r'欣赏(.+?)(?:，|。|\n|$)',  # 欣赏后面的景点，直到标点或结束
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, day_text)
                for match in matches:
                    # 清理匹配结果
                    attraction = match.strip()
                    # 过滤掉太短的字符串、时间信息和常见的非景点词汇
                    if (
                        len(attraction) > 2 and 
                        attraction not in ['上午', '下午', '晚上', '酒店', '餐厅', '地铁站'] and
                        not re.match(r'\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})?', attraction) and  # 过滤时间格式
                        not re.match(r'^\d+$', attraction) and  # 过滤纯数字
                        not any(keyword in attraction for keyword in ['分钟', '小时', '步行', '打车', '地铁', '公交', '核心区域', '观景台', '路程', '距离', '时间', '车程', '拍照', '禁用', '夜色', '景色', '风景'])
                    ):
                        # 进一步清理，移除括号和其他无关字符
                        attraction = re.sub(r'[()（）]', '', attraction)
                        attraction = re.sub(r'\s+', ' ', attraction)
                        if len(attraction) > 2:
                            attractions.append(attraction)
        
        # 去重并返回前3个景点
        return list(set(attractions))[:3]

    def plan_trip(
        self, user_type: str, departure_city: str, city: str, preferences: List[str], budget: int, days: int
    ) -> Dict[str, Any]:
        # 构建统一的提示词，一次调用获取所有信息
        combined_prompt = f"""
        你是一位专业的旅游规划师，请为以下用户制定完整的旅游计划。
        
        用户信息：
        - 旅游类型：{user_type}
        - 出发地：{departure_city}
        - 目的地：{city}
        - 偏好：{', '.join(preferences)}
        - 人均总预算：{budget}元（包含往返交通费用）
        - 天数：{days}天
        
        **重要提示：请特别考虑以下因素：**
        1. **交通安排**：需要规划从{departure_city}到{city}的往返交通，包括：
           - 去程交通方式（飞机、高铁、火车、汽车等）
           - 返程交通方式
           - 具体的车次/航班信息、时间、费用
           - 城市内和景点间的交通安排
           - **特别注意**：往返交通费用必须包含在人均总预算{budget}元内
        
        2. **预算分配**：人均总预算{budget}元需要合理分配：
           - 往返交通费用（从{departure_city}到{city}的往返）
           - 住宿费用（{days}晚）
           - 餐饮费用（{days}天）
           - 景点门票和活动费用
           - 确保总费用不超过{budget}元
           - **特别注意**：酒店价格必须符合扣除交通费用后的预算
        
        3. **时间因素**：
           - 不同季节的特色活动（如哈尔滨冬天的滑雪和冰雕，夏季的海边度假）
           - 节假日和特殊节庆（如春节的花灯、元宵节的灯会、中秋节的赏月）
           - 季节性美食和特产（如秋季的螃蟹、冬季的火锅）
           - 天气对行程安排的影响（如雨季的室内活动安排）
        
        请按以下格式输出完整的旅游计划：
        
        ===行程安排===
        请为每一天生成详细的行程安排，格式如下：
        
        第1天（从{departure_city}出发）：
        - 上午：从{departure_city}出发，乘坐[具体交通方式]前往{city}
        - 下午：抵达{city}，办理入住，熟悉周边环境
        - 晚上：...
        
        第2天：
        - 上午：...
        - 下午：...
        - 晚上：...
        
        第{days}天（返回{departure_city}）：
        - 上午：...
        - 下午：从{city}返回{departure_city}
        - 晚上：抵达{departure_city}
        
        （以此类推，直到第{days}天）
        
        ===酒店推荐===
        **重要：请严格遵守用户的预算限制！** 用户人均总预算为{budget}元，行程{days}天。
        
        **预算分配说明：**
        - 人均总预算：{budget}元（包含往返交通费用）
        - 需要先扣除从{departure_city}到{city}的往返交通费用
        - 剩余预算用于住宿、餐饮、景点门票等
        - 平均每天住宿预算约为({budget} - 往返交通费用) / {days}元
        
        请详细推荐3-5家合适的酒店，每家酒店必须包含以下信息，并且按照指定格式输出：
        酒店名称：[酒店名称]
        位置：[酒店位置，靠近哪些景点，距离市中心的距离]
        价格：[价格区间，具体到每晚的价格范围，必须符合扣除交通费用后的预算]
        特色：[酒店特色，如设施、服务、风格等]
        推荐理由：[详细的推荐理由，为什么适合该用户的旅游类型和预算]
        
        **预算限制要求：**
        - 推荐的酒店每晚价格必须控制在扣除交通费用后的预算范围内
        - 优先推荐性价比高的酒店
        - 如果预算有限，可以推荐经济型酒店或民宿
        - 确保酒店价格与用户总预算相匹配，考虑交通成本
        
        ===交通建议===
        **重要：请详细规划从{departure_city}到{city}的往返交通安排**
        
        请详细提供以下交通信息，并且按照指定格式输出：
        
        **往返交通安排：**
        去程：[从{departure_city}到{city}的具体交通方式，包括：
              - 交通方式（飞机/高铁/火车/汽车等）
              - 具体的车次/航班号
              - 出发时间、到达时间
              - 行程时长
              - 单程费用]
        
        返程：[从{city}返回{departure_city}的具体交通方式，包括：
              - 交通方式（飞机/高铁/火车/汽车等）
              - 具体的车次/航班号
              - 出发时间、到达时间
              - 行程时长
              - 单程费用]
        
        **城市内交通：**
        [详细的城市内交通方式，包括：
         - 主要交通工具（地铁、公交、出租车、网约车等）
         - 推荐的地铁线路和公交线路
         - 大概的交通费用估算
         - 交通卡或优惠信息]
        
        **景点间交通：**
        [详细的景点之间的交通安排，包括：
         - 具体的交通方式
         - 行程时间
         - 大概费用]
        
        **总交通费用估算：**
        [详细的交通费用估算，包括：
         - 往返交通总费用
         - 城市内交通总费用
         - 景点间交通总费用
         - 交通总费用占预算的比例]
        
        请确保内容详细实用，符合用户的旅游类型和预算，并充分考虑时间因素对旅游体验的影响。
        请严格按照指定格式输出，以便于解析。
        请提供尽可能详细的信息，不要使用模糊的描述。
        """

        # 只调用一次LLM
        response = self._call_llm(combined_prompt)

        # 解析响应内容
        itinerary_text = self._extract_section(response, "行程安排")
        hotels_text = self._extract_section(response, "酒店推荐")
        transport_text = self._extract_section(response, "交通建议")

        # 如果没有找到明确的分隔，使用整个响应作为行程
        if not itinerary_text:
            itinerary_text = response

        # 解析每日行程
        daily_itineraries = self._parse_daily_itinerary(itinerary_text, days)

        # 为每日行程添加景点信息，不包含图片
        itinerary_with_images = []
        for i, activities in enumerate(daily_itineraries):
            itinerary_with_images.append({
                "day": i + 1,
                "activities": activities
            })

        hotels = (
            self._parse_hotels(hotels_text)
            if hotels_text
            else [
                {
                    "name": "酒店推荐",
                    "location": "根据行程区域选择",
                    "price": f"{budget//days//3}-{budget//days//2}元/晚",
                    "features": "根据偏好选择",
                    "reason": "建议提前预订，选择交通便利的酒店",
                }
            ]
        )

        transportation = (
            self._parse_transportation(transport_text)
            if transport_text
            else {
                "to_city": "根据出发地选择飞机或高铁",
                "in_city": "地铁+公交+打车结合",
                "between_attractions": "根据景点位置选择最优路线",
                "cost_estimate": f"约{budget//5}元",
            }
        )

        return {
            "itinerary": itinerary_with_images,
            "hotels": hotels,
            "transportation": transportation,
        }

    def _extract_section(self, text: str, section_name: str) -> str:
        """从文本中提取特定部分的内容"""
        patterns = [
            rf"===?{section_name}===?\s*\n?(.*?)(?====?|$)",
            rf"{section_name}[：:]\s*\n?(.*?)(?=\n\s*(?:===?|\w+[：:]|$))",
            rf"(?:^|\n)\s*{section_name}[：:]?\s*\n?(.*?)(?=\n\s*(?:===?|\w+[：:]|$))",
            rf"(?:^|\n)\s*【{section_name}】\s*\n?(.*?)(?=\n\s*(?:===?|\w+[：:]|$))",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if match:
                content = match.group(1).strip()
                if content:
                    return content
        return ""
