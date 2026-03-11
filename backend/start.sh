#!/bin/bash

# 懒人旅游助手AI版 - 后端启动脚本
# 作者：AI助手
# 创建时间：2026-03-11

echo "=========================================="
echo "   懒人旅游助手AI版 - 后端服务启动"
echo "=========================================="

# 检查Pipenv环境是否存在
if [ ! -f "Pipfile" ]; then
    echo "❌ 错误：未找到Pipfile，请确保在backend目录下运行此脚本"
    exit 1
fi

# 检查Python环境
echo "🔍 检查Python环境..."
python_version=$(python --version 2>&1)
echo "当前Python版本: $python_version"

# 检查Pipenv是否已安装
if ! command -v pipenv &> /dev/null; then
    echo "❌ 错误：未找到pipenv，请先安装pipenv"
    echo "安装命令: pip install pipenv"
    exit 1
fi

# 检查虚拟环境是否存在
if [ ! -d "$(pipenv --venv 2>/dev/null)" ]; then
    echo "📦 虚拟环境不存在，正在安装依赖..."
    pipenv install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 虚拟环境已存在"
fi

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