#!/bin/bash

# 懒人旅游助手AI版 - 后端启动脚本
# 作者：AI助手
# 创建时间：2026-03-11

echo "=========================================="
echo "   懒人旅游助手AI版 - 后端服务启动"
echo "=========================================="

# 检查.env文件是否存在
if [ ! -f ".env" ]; then
    echo "⚠️  警告：未找到.env文件，请确保已配置API密钥"
    echo "请创建.env文件并添加: API_KEY=your_api_key_here"
fi

# 启动服务
echo "🚀 启动后端服务..."
echo "服务地址: http://localhost:8030"
echo "API文档: http://localhost:8030/docs"
echo ""
echo "按 Ctrl+C 停止服务"
echo "=========================================="

# 启动FastAPI服务
pipenv run uvicorn main:app --reload --port 8030 --host 0.0.0.0