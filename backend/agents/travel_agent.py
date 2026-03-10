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
                rf"第{day_num}天[：:]\s*(.+?)(?=(?:第{day_num + 1}天)|$)",
                rf"第{day_num}天[：:]\s*(.+?)(?=(?:第\d+天)|$)",
                rf"(?:^|\n)\s*第{day_num}天[：:]\s*(.+?)(?=(?:\n\s*第\d+天)|$)",
            ]

            for pattern in patterns:
                match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
                if match:
                    content = match.group(1).strip()
                    if content:
                        daily_itineraries.append(content)
                        break

        if len(daily_itineraries) < days:
            daily_itineraries.extend([""] * (days - len(daily_itineraries)))

        return daily_itineraries[:days]

    def _parse_hotels(self, hotels_text: str) -> List[Dict[str, str]]:
        """解析酒店推荐文本为结构化数据"""
        hotels = []
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
                    "location": "详见下方内容",
                    "price": "根据预算选择",
                    "features": "多种选择",
                    "reason": (
                        hotels_text[:200] + "..."
                        if len(hotels_text) > 200
                        else hotels_text
                    ),
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
        return {
            "to_city": self._extract_field(
                transport_text,
                [
                    r"到达.*?交通[：:]\s*(.+?)(?:\n|$)",
                    r"到达.*?方式[：:]\s*(.+?)(?:\n|$)",
                    r"(?:飞机|高铁|火车|自驾).*?(?:\n|$)",
                ],
            )
            or "详见下方建议",
            "in_city": self._extract_field(
                transport_text,
                [
                    r"城市内.*?交通[：:]\s*(.+?)(?:\n|$)",
                    r"市内.*?交通[：:]\s*(.+?)(?:\n|$)",
                    r"(?:地铁|公交|打车|出租车).*?(?:\n|$)",
                ],
            )
            or "详见下方建议",
            "between_attractions": self._extract_field(
                transport_text,
                [
                    r"景点.*?交通[：:]\s*(.+?)(?:\n|$)",
                    r"各景点.*?交通[：:]\s*(.+?)(?:\n|$)",
                ],
            )
            or "详见下方建议",
            "cost_estimate": self._extract_field(
                transport_text,
                [
                    r"费用估算[：:]\s*(.+?)(?:\n|$)",
                    r"交通费用[：:]\s*(.+?)(?:\n|$)",
                    r"(?:约|大约)?\s*\d+\s*元",
                ],
            )
            or "根据实际选择",
        }

    def plan_trip(
        self, user_type: str, city: str, preferences: List[str], budget: int, days: int
    ) -> Dict[str, Any]:
        # 构建统一的提示词，一次调用获取所有信息
        combined_prompt = f"""
        你是一位专业的旅游规划师，请为以下用户制定完整的旅游计划。
        
        用户信息：
        - 旅游类型：{user_type}
        - 目的地：{city}
        - 偏好：{', '.join(preferences)}
        - 预算：{budget}元
        - 天数：{days}天
        
        请按以下格式输出完整的旅游计划：
        
        ===行程安排===
        请为每一天生成详细的行程安排，格式如下：
        
        第1天：
        - 上午：...
        - 下午：...
        - 晚上：...
        
        第2天：
        - 上午：...
        - 下午：...
        - 晚上：...
        
        （以此类推，直到第{days}天）
        
        ===酒店推荐===
        推荐3-5家合适的酒店，每家酒店包含：
        - 酒店名称
        - 位置（靠近哪些景点）
        - 价格区间
        - 酒店特色
        - 推荐理由
        
        ===交通建议===
        - 到达城市交通（飞机、高铁等）
        - 城市内交通（地铁、公交、打车等）
        - 景点间交通安排
        - 交通费用估算
        
        请确保内容详细实用，符合用户的旅游类型和预算。
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
            "itinerary": [
                {
                    "day": i + 1,
                    "activities": (
                        daily_itineraries[i]
                        if i < len(daily_itineraries)
                        else "暂无内容"
                    ),
                }
                for i in range(days)
            ],
            "hotels": hotels,
            "transportation": transportation,
        }

    def _extract_section(self, text: str, section_name: str) -> str:
        """从文本中提取特定部分的内容"""
        patterns = [
            rf"===?{section_name}===?\s*\n?(.*?)(?====?|$)",
            rf"{section_name}[：:]\s*\n?(.*?)(?=\n\s*(?:===?|\w+[：:]|$))",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ""
