from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.travel_agent import TravelAgent

router = APIRouter()

class TravelRequest(BaseModel):
    user_type: str  # 大学生特种兵游，遛娃亲子游，同事团建游，老年人夕阳游
    city: str  # 旅游城市
    preferences: list[str]  # 喜好，如：自然风光，海边赶海，历史人文景观，民俗风土人情
    budget: int  # 预算
    days: int  # 旅游天数

class TravelResponse(BaseModel):
    itinerary: list[dict]  # 每日行程
    hotels: list[dict]  # 酒店推荐
    transportation: dict  # 交通建议

@router.post("/plan", response_model=TravelResponse)
def plan_trip(request: TravelRequest):
    try:
        agent = TravelAgent()
        result = agent.plan_trip(
            user_type=request.user_type,
            city=request.city,
            preferences=request.preferences,
            budget=request.budget,
            days=request.days
        )
        return TravelResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
