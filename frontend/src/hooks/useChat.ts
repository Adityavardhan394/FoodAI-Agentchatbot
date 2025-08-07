import { useState, useCallback, useRef } from 'react';
import { ChatMessage, ChatState, Model, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000';

export const useChat = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    selectedModel: '',
    isLoading: false,
    error: undefined,
  });

  const [models, setModels] = useState<Model[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/models`);
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
      setModels(data.models || []);
      
      // Set default model if none selected
      if (!chatState.selectedModel && data.models.length > 0) {
        setChatState(prev => ({ ...prev, selectedModel: data.models[0].name }));
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setChatState(prev => ({ ...prev, error: 'Failed to fetch available models' }));
    }
  }, [chatState.selectedModel]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !chatState.selectedModel) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: undefined,
    }));

    // Create assistant message placeholder
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, assistantMessage],
    }));

    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: chatState.selectedModel,
          messages: [...chatState.messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              const apiResponse: ApiResponse = jsonData;

              if (apiResponse.error) {
                throw new Error(apiResponse.error);
              }

              assistantContent += apiResponse.content || '';

              // Update the assistant message
              // eslint-disable-next-line no-loop-func
              setChatState(prev => ({
                ...prev,
                messages: prev.messages.map((msg, index) => {
                  if (index === prev.messages.length - 1 && msg.role === 'assistant') {
                    return { ...msg, content: assistantContent };
                  }
                  return msg;
                }),
              }));

              if (apiResponse.done) {
                setChatState(prev => ({ ...prev, isLoading: false }));
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error('Error sending message:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to send message',
        messages: prev.messages.slice(0, -1), // Remove the empty assistant message
      }));
    }
  }, [chatState.selectedModel, chatState.messages]);

  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setChatState(prev => ({
      ...prev,
      messages: [],
      isLoading: false,
      error: undefined,
    }));
  }, []);

  const setSelectedModel = useCallback((modelName: string) => {
    setChatState(prev => ({ ...prev, selectedModel: modelName }));
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setChatState(prev => ({ ...prev, isLoading: false }));
  }, []);

  const exportChat = useCallback((format: 'txt' | 'md' = 'md') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `ollama-chat-${timestamp}.${format}`;
    
    let content = '';
    if (format === 'md') {
      content = `# Ollama Chat Export\n\n**Model:** ${chatState.selectedModel}\n**Date:** ${new Date().toLocaleString()}\n\n---\n\n`;
      chatState.messages.forEach(msg => {
        content += `## ${msg.role === 'user' ? '👤 User' : '🤖 Assistant'}\n\n${msg.content}\n\n`;
      });
    } else {
      content = `Ollama Chat Export\nModel: ${chatState.selectedModel}\nDate: ${new Date().toLocaleString()}\n\n`;
      chatState.messages.forEach(msg => {
        content += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [chatState.messages, chatState.selectedModel]);

  return {
    ...chatState,
    models,
    sendMessage,
    clearChat,
    setSelectedModel,
    stopGeneration,
    exportChat,
    fetchModels,
  };
};