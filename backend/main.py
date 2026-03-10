from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import travel

app = FastAPI()

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(travel.router, prefix="/api/travel")

@app.get("/")
def read_root():
    return {"message": "AI Travel Agent API"}

@app.post("/test")
def test_endpoint():
    return {"message": "Test endpoint works"}
