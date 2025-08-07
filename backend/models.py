from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    stream: bool = True

class ChatResponse(BaseModel):
    message: ChatMessage
    done: bool = False

class ModelInfo(BaseModel):
    name: str
    size: Optional[str] = None
    digest: Optional[str] = None
    modified_at: Optional[str] = None

class ModelsResponse(BaseModel):
    models: List[ModelInfo]

class HealthResponse(BaseModel):
    status: str
    ollama_connected: bool
    timestamp: datetime