# Lazy Travel Assistant AI

A smart AI-powered travel planning assistant that generates personalized travel itineraries based on user preferences, budget, and current season. Built with FastAPI backend and React frontend.

## 🌟 Features

- **AI-Powered Itinerary Planning**: Generates comprehensive travel plans using advanced LLM models
- **Seasonal Recommendations**: Recommends appropriate activities based on current season (spring, summer, autumn, winter)
- **Budget Optimization**: Calculates optimal budget allocation including transportation, accommodation, meals, and attractions
- **Round-Trip Planning**: Includes detailed transportation arrangements for both outbound and return journeys
- **Personalized Preferences**: Supports multiple travel types (student adventure, family trip, group tour, senior travel)
- **Dynamic Content**: Considers time factors, holidays, seasonal specialties, and weather conditions

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **LLM Integration**: DeepSeek-R1-0528-Qwen3-8B (configurable)
- **Virtual Environment**: Pipenv
- **Configuration**: python-dotenv

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI v5
- **Markdown Rendering**: react-markdown
- **Build Tool**: Create React App

## 📋 Prerequisites

- **Node.js**: v14.16.1 or higher
- **Python**: v3.11 or higher
- **Pipenv**: Python package manager

## 🚀 Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies using Pipenv:
```bash
pipenv install
```

3. Create `.env` file with your API key:
```env
API_KEY=your_api_key_here
```

4. Start the backend server:
```bash
pipenv run uvicorn main:app --reload --port 8030 --host 0.0.0.0
```

Or use the provided script:
```bash
pipenv run bash start.sh
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 📖 Usage

1. **Select Travel Type**: Choose from student adventure, family trip, group tour, or senior travel
2. **Enter Departure & Destination**: Specify your departure city and destination
3. **Set Preferences**: Select your travel interests (nature, beach, history, culture, etc.)
4. **Configure Budget & Duration**: Set your per capita total budget (including transportation) and trip duration
5. **Generate Plan**: Click "Generate Travel Plan" to get your personalized itinerary

## 🎯 Features in Detail

### Seasonal Recommendations
The assistant considers the current season when recommending activities:
- **Spring (March-May)**: Flower viewing, hiking, outdoor activities
- **Summer (June-August)**: Beach resorts, water activities, night markets
- **Autumn (September-November)**: Leaf viewing, fruit picking, photography
- **Winter (December-February)**: Skiing, ice sculptures, hot springs

### Budget Allocation
The system intelligently allocates your budget across:
- Round-trip transportation costs
- Accommodation (multi-night stay)
- Daily meals and dining
- Attraction tickets and activities

### Transportation Planning
Comprehensive transportation arrangements including:
- Outbound and return journey details
- City internal transportation options
- Inter-attraction transportation
- Cost estimates for all transportation

## 📁 Project Structure

```
travel_agent/
├── backend/
│   ├── agents/
│   │   └── travel_agent.py      # Core AI agent and LLM integration
│   ├── routers/
│   │   └── travel.py            # API endpoints
│   ├── main.py                  # FastAPI application
│   ├── Pipfile                  # Python dependencies
│   ├── Pipfile.lock             # Locked dependencies
│   └── start.sh                 # Startup script
├── frontend/
│   ├── public/
│   │   └── index.html           # HTML template
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   └── index.jsx            # Entry point
│   └── package.json             # Node.js dependencies
└── .gitignore                   # Git ignore rules
```

## 🔧 Configuration

### Environment Variables (.env)

```env
API_KEY=your_deepseek_api_key
```

### API Endpoints

- **POST** `/api/travel/plan` - Generate travel plan
  - Request body:
    ```json
    {
      "user_type": "student_adventure",
      "departure_city": "Beijing",
      "city": "Harbin",
      "preferences": ["nature", "history"],
      "budget": 2000,
      "days": 3,
      "model": "DeepSeek-R1-0528-Qwen3-8B"
    }
    ```

## 🎨 Customization

### Changing LLM Model

Edit `backend/agents/travel_agent.py` and modify the `LLMModel` enum to use different models:
- DeepSeek series
- Zhipu AI (GLM) series
- MiniMax series
- And more...

### Adjusting Budget Constraints

Modify the budget validation in `backend/routers/travel.py`:
- Maximum budget: 50,000 CNY per person
- Daily budget considerations

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Powered by DeepSeek LLM API
- Built with FastAPI and React
- UI components from Material-UI

## 📧 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Made with ❤️ by the AI Travel Assistant Team
