from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx
import json
import asyncio
from datetime import datetime
from typing import AsyncGenerator
import logging

from models import ChatRequest, ChatMessage, ModelInfo, ModelsResponse, HealthResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Ollama Chat Interface API",
    description="Backend API for local Ollama chat interface",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_BASE_URL = "http://localhost:11434"

async def check_ollama_connection() -> bool:
    """Check if Ollama is running and accessible"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return response.status_code == 200
    except Exception as e:
        logger.error(f"Failed to connect to Ollama: {e}")
        return False

@app.get("/health")
async def health_check() -> HealthResponse:
    """Health check endpoint"""
    ollama_connected = await check_ollama_connection()
    return HealthResponse(
        status="healthy" if ollama_connected else "degraded",
        ollama_connected=ollama_connected,
        timestamp=datetime.now()
    )

@app.get("/api/models")
async def get_models() -> ModelsResponse:
    """Get available Ollama models"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch models from Ollama")
        
        data = response.json()
        models = []
        
        for model_data in data.get("models", []):
            models.append(ModelInfo(
                name=model_data.get("name", ""),
                size=model_data.get("size"),
                digest=model_data.get("digest"),
                modified_at=model_data.get("modified_at")
            ))
        
        return ModelsResponse(models=models)
    
    except httpx.RequestError as e:
        logger.error(f"Request error when fetching models: {e}")
        raise HTTPException(status_code=503, detail="Ollama service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error when fetching models: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def stream_ollama_chat(chat_request: ChatRequest) -> AsyncGenerator[str, None]:
    """Stream chat responses from Ollama"""
    try:
        # Convert messages to Ollama format
        ollama_messages = []
        for msg in chat_request.messages:
            ollama_messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Prepare request payload for Ollama
        payload = {
            "model": chat_request.model,
            "messages": ollama_messages,
            "stream": True
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                f"{OLLAMA_BASE_URL}/api/chat",
                json=payload,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error(f"Ollama API error: {response.status_code} - {error_text}")
                    yield f"data: {json.dumps({'error': f'Ollama API error: {response.status_code}'})}\n\n"
                    return
                
                async for chunk in response.aiter_lines():
                    if chunk:
                        try:
                            # Parse the JSON response from Ollama
                            chunk_data = json.loads(chunk)
                            
                            # Extract the message content
                            if "message" in chunk_data and "content" in chunk_data["message"]:
                                content = chunk_data["message"]["content"]
                                is_done = chunk_data.get("done", False)
                                
                                # Format for frontend
                                response_data = {
                                    "content": content,
                                    "done": is_done
                                }
                                
                                yield f"data: {json.dumps(response_data)}\n\n"
                                
                                if is_done:
                                    break
                                    
                        except json.JSONDecodeError:
                            logger.warning(f"Failed to parse chunk: {chunk}")
                            continue
                            
    except httpx.RequestError as e:
        logger.error(f"Request error during streaming: {e}")
        yield f"data: {json.dumps({'error': 'Connection error with Ollama'})}\n\n"
    except Exception as e:
        logger.error(f"Unexpected error during streaming: {e}")
        yield f"data: {json.dumps({'error': 'Internal server error'})}\n\n"

@app.post("/api/chat")
async def chat_with_ollama(chat_request: ChatRequest):
    """Stream chat with Ollama model"""
    if not await check_ollama_connection():
        raise HTTPException(status_code=503, detail="Ollama service unavailable")
    
    return StreamingResponse(
        stream_ollama_chat(chat_request),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)