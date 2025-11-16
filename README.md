# ThermoTrace - AI Cooling Control Dashboard 🌡️

> **Intelligent real-time dashboard for monitoring and optimizing thermal cooling systems using AI agents, LangSmith tracing, and Groq AI chatbot.**
<img width="1412" height="1460" alt="image" src="https://github.com/user-attachments/assets/582c1815-2851-4a18-ad0d-eec9e5e1ee11" /> <img width="1415" height="1461" alt="image" src="https://github.com/user-attachments/assets/8aa75421-1daf-4663-9e26-fa18cc3efd1e" />



## 🎯 Overview

ThermoTrace is a Next.js-powered monitoring platform that visualizes AI agent decision-making for cooling system optimization. It features real-time trace visualization from LangSmith, interactive flowcharts, and an AI-powered chatbot using Groq's LLaMA 3.3 70B model.

**Key Highlights:**
- 🤖 **AI Agent Visualization** - Interactive flowcharts showing agent reasoning and decision paths
- 💬 **Groq AI Chatbot** - Ultra-fast responses (0.5-2s) with thermal domain expertise
- 📊 **Real-time Metrics** - Live temperature, efficiency, and system performance monitoring
- 🔄 **LangSmith Integration** - Fetch and visualize actual agent execution traces
- 📈 **Digital Twin Simulation** - Visual system diagram with live predictions

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and pnpm
- LangSmith account (optional - falls back to mock data)
- Groq API key (optional - for chatbot functionality)

### Installation

```bash
# Clone the repository
git clone https://github.com/Vishal25102002/Uclhack-X-Thermotrace.git
cd ucl-hacker

# Install dependencies
pnpm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## ⚙️ Configuration

Create a `.env.local` file with the following:

```env
# LangSmith (Optional - for real agent traces)
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=lsv2_pt_your_api_key_here
LANGSMITH_PROJECT=your-project-name

# Groq AI (Optional - for chatbot)
GROQ_API_KEY=gsk_your_groq_api_key_here
```

## ✨ Features

### 🎨 Dashboard Components
- **Agent Flowchart** - Visual representation of AI decision-making with clickable nodes
- **Metrics Cards** - Real-time monitoring of cooling tons, power consumption, and temperatures
- **Timeline View** - Event-based timeline of system operations and decisions
- **Chain of Thought** - Detailed AI reasoning breakdown with context and validation
- **Digital Twin** - Interactive system diagram with flow indicators and predictions
- **AI Chatbot** - Context-aware assistant for thermal system queries

### 🔧 Technical Features
- Interactive flowcharts with auto-scaling and responsive layout
- Real-time data fetching from LangSmith API
- Graceful fallback to mock data when APIs are unavailable
- Time-based filtering (24h, 7d, 30d)
- Ultra-fast AI responses using Groq's LPU infrastructure
- Responsive design with Tailwind CSS and shadcn/ui

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # Groq AI chatbot endpoint
│   │   └── websocket/     # Real-time data websocket
│   ├── flowchart/         # Flowchart visualization page
│   └── page.tsx           # Main dashboard
├── components/
│   ├── agent-flowchart/   # Agent trace visualization
│   ├── chat/              # AI chatbot interface
│   ├── dashboard/         # Dashboard cards and layout
│   ├── chain-of-thought/  # Decision reasoning panels
│   ├── digital-twin/      # System diagram components
│   └── ui/                # Reusable UI components (shadcn)
├── hooks/                 # Custom React hooks
├── services/              # API integrations (LangSmith, WebSocket)
├── types/                 # TypeScript definitions
└── utils/                 # Helper functions and mock data
```

## 🤖 AI Chatbot

The integrated chatbot is powered by **Groq AI with LLaMA 3.3 70B**, providing:
- **Lightning-fast responses** (500+ tokens/second)
- **Domain expertise** in thermal systems, HVAC, and energy optimization
- **Context awareness** from last 6 messages
- **Professional technical guidance**

Example questions:
- "What is cooling ton?"
- "How can I optimize energy efficiency?"
- "Explain the agent's decision trace"
- "What do the safety violations mean?"

## 📊 LangSmith Integration

Connect your AI agents to visualize real execution traces:

```python
# Python example
from langsmith import traceable

@traceable(name="CoolingOptimizationAgent")
def cooling_agent(temperature: float):
    decision = analyze_temperature(temperature)
    return execute_action(decision)
```

The dashboard will automatically fetch and display your agent's decision paths.

## 🎨 UI Preview

![Dashboard Screenshot](./public/dashboard-preview.png)

*Main dashboard showing real-time metrics, agent flowchart, and timeline*

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **AI/ML:** Groq AI (LLaMA 3.3 70B), LangSmith SDK
- **Visualization:** React Flow, Recharts
- **State Management:** React Hooks
- **Date Handling:** date-fns

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Built for UCL Hackathon** | Made with ❤️ by ThermoTrace Team
