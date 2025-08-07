#!/bin/bash

# Ollama Chat Interface Startup Script

echo "🚀 Starting Ollama Chat Interface..."

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Warning: Ollama is not running on localhost:11434"
    echo "Please start Ollama first:"
    echo "  ollama serve"
    echo ""
    echo "And make sure you have at least one model installed:"
    echo "  ollama pull llama3"
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to exit..."
fi

# Function to kill background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap for cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend
echo "📡 Starting FastAPI backend..."
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting React frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started!"
echo "📡 Backend: http://localhost:8000"
echo "🎨 Frontend: http://localhost:3000"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait