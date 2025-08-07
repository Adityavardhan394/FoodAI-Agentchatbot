# Ollama Chat Interface

A minimal and beautiful local chat interface for interacting with models served via Ollama.

## Features

- 🎨 Modern React frontend with clean UI
- ⚡ FastAPI backend with streaming responses
- 🤖 Auto-discovery of installed Ollama models
- 💬 Full chat history preservation
- 🌙 Dark/light mode toggle
- 📝 Markdown support for code formatting
- 📁 Export chat history as .txt or .md
- 🔄 Model switching mid-chat
- 🚀 Fully offline operation

## Project Structure

```
ollama-chat/
├── backend/           # FastAPI server
│   ├── main.py       # Main server file
│   ├── models.py     # Data models
│   └── requirements.txt
├── frontend/         # React application
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

## Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- Ollama installed and running locally

## Quick Start

### Option 1: Automated Setup (Recommended)

1. **Install Ollama** (if not already installed):
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Start Ollama and pull a model**:
   ```bash
   ollama serve  # In one terminal
   ollama pull llama3  # In another terminal
   ```

3. **Install dependencies and start everything**:
   ```bash
   # Install backend dependencies
   cd backend && pip install -r requirements.txt && cd ..
   
   # Install frontend dependencies
   cd frontend && npm install && cd ..
   
   # Start both services
   ./start.sh
   ```

### Option 2: Manual Setup

1. **Install Ollama and pull a model** (same as above)

2. **Start the backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Open your browser** to `http://localhost:3000`

## API Endpoints

- `GET /api/models` - Get available Ollama models
- `POST /api/chat` - Send chat message (streaming response)
- `GET /health` - Health check

## Usage

1. Select a model from the dropdown
2. Type your message and press Enter
3. Watch the AI respond in real-time
4. Switch models anytime during the conversation
5. Export your chat history when needed

## Development

The application is designed to be lightweight and fast, with real-time streaming responses from Ollama models.