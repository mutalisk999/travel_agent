from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict
from agents.travel_agent import TravelAgent, LLMModel

router = APIRouter()

class TravelRequest(BaseModel):
    user_type: str  # 大学生特种兵游，遛娃亲子游，同事团建游，老年人夕阳游
    departure_city: str  # 出发城市
    city: str  # 旅游城市
    preferences: List[str]  # 喜好，如：自然风光，海边赶海，历史人文景观，民俗风土人情
    budget: int  # 预算
    days: int  # 旅游天数
    model: str = Field(default="KAT-Coder-Pro-V1")  # LLM模型名称

class TravelResponse(BaseModel):
    itinerary: List[Dict]  # 每日行程
    hotels: List[Dict]  # 酒店推荐
    transportation: Dict  # 交通建议

import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/plan", response_model=TravelResponse)
def plan_trip(request: TravelRequest):
    try:
        logger.info(f"Received request: {request}")
        # 获取用户指定的模型，如果不存在则使用默认模型
        model_name = request.model
        logger.info(f"Model name: {model_name}")
        # 将模型名称转换为枚举成员
        model = None
        for member in LLMModel:
            if member.value == model_name:
                model = member
                break
        if model is None:
            model = LLMModel.DeepSeek_R1_0528_Qwen3_8B
        logger.info(f"Selected model: {model}")
        agent = TravelAgent(model=model)
        result = agent.plan_trip(
            user_type=request.user_type,
            departure_city=request.departure_city,
            city=request.city,
            preferences=request.preferences,
            budget=request.budget,
            days=request.days
        )
        logger.info(f"Generated result: {result}")
        return TravelResponse(**result)
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
