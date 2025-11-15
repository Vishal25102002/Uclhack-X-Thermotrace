# UCL Hacker - AI Cooling Control Dashboard

An intelligent dashboard for monitoring and visualizing AI agent decision-making for cooling system optimization. Features real-time trace visualization from LangSmith with interactive flowcharts.

## 🚀 Quick Start

**See [QUICKSTART.md](./QUICKSTART.md) for setup instructions!**

### Prerequisites
- Node.js 20+ and pnpm
- LangSmith account (optional, falls back to mock data)

## Getting Started

First, configure your LangSmith credentials (optional):

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your LangSmith API key and project name
# See LANGSMITH_SETUP.md for detailed instructions
```

Then, run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ✨ Features

### Dynamic LangSmith Integration
- **Real-time Trace Visualization**: Fetch and display actual AI agent execution traces
- **Interactive Flowcharts**: Click nodes to see inputs, outputs, and metadata
- **Auto-scaling Layout**: Flowcharts automatically fit container with proper scrolling
- **Time-based Filtering**: Filter traces by 24h, 7d, or 30d
- **Graceful Fallback**: Works with mock data if LangSmith is not configured

### Dashboard Components
- **Agent Execution Trace**: Visual flowchart of agent decision-making process
- **Timeline**: Event-based timeline of system operations
- **Metrics Cards**: Real-time system metrics (temperature, efficiency, AI decisions)
- **Chain of Thought**: Detailed reasoning breakdown for AI decisions
- **System Status**: Live system health and uptime monitoring

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 3 steps
- **[LANGSMITH_SETUP.md](./LANGSMITH_SETUP.md)** - Detailed LangSmith setup guide
- **[IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md)** - Technical implementation details
- **[VISUAL_IMPROVEMENTS.md](./VISUAL_IMPROVEMENTS.md)** - Before/after visual comparisons

## 🔧 Recent Improvements

### Flowchart Visualization (Latest)
- ✅ Fixed arrows expanding beyond container
- ✅ Dynamic SVG sizing based on actual content
- ✅ Overflow scrolling for large flowcharts
- ✅ Responsive layout with flex-wrap
- ✅ Improved auto-scaling algorithm

### LangSmith Integration
- ✅ Added LangSmith SDK for real trace fetching
- ✅ Dynamic flowchart generation from trace data
- ✅ Real-time updates with configurable refresh interval
- ✅ Comprehensive error handling and fallbacks

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── langsmith/     # LangSmith API endpoints
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── dashboard/         # Dashboard cards and layouts
│   ├── visualization/     # Flowchart and charts
│   │   └── AgentFlowChart.tsx  # LangSmith trace flowchart
│   ├── timeline/          # Timeline components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
│   └── useLangSmithTrace.ts   # LangSmith data fetching
├── services/              # External service integrations
│   └── langsmith.ts       # LangSmith SDK client
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🔑 Environment Variables

Required for LangSmith integration (optional, app works without):

```env
LANGSMITH_API_KEY=your_api_key_here
LANGSMITH_PROJECT=your_project_name
```

See `.env.local.example` for full configuration options.

## Learn More

### Next.js
To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
