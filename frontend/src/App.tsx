import React, { useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { LoadingIndicator } from './components/LoadingIndicator';
import { useChat } from './hooks/useChat';
import { useTheme } from './hooks/useTheme';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

function App() {
  const chat = useChat();
  const { theme, toggleTheme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages]);

  // Fetch models on component mount
  useEffect(() => {
    chat.fetchModels();
  }, [chat.fetchModels]);

  const hasNoModels = chat.models.length === 0;
  const hasMessages = chat.messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header
        models={chat.models}
        selectedModel={chat.selectedModel}
        onModelChange={chat.setSelectedModel}
        onClearChat={chat.clearChat}
        onExportChat={chat.exportChat}
        onRefreshModels={chat.fetchModels}
        theme={theme}
        onToggleTheme={toggleTheme}
        messageCount={chat.messages.length}
        isLoading={chat.isLoading}
      />

      {/* Main chat area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Error message */}
        {chat.error && (
          <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-500 dark:text-red-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">Connection Error</p>
              <p className="text-red-600 dark:text-red-300 text-sm">{chat.error}</p>
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                Make sure Ollama is running on localhost:11434
              </p>
            </div>
          </div>
        )}

        {/* No models warning */}
        {hasNoModels && !chat.error && (
          <div className="mx-4 mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3">
            <WifiOff className="text-yellow-500 dark:text-yellow-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">No Models Available</p>
              <p className="text-yellow-600 dark:text-yellow-300 text-sm">
                No Ollama models found. Please install a model first.
              </p>
              <p className="text-yellow-500 dark:text-yellow-400 text-xs mt-1">
                Run: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">ollama pull llama3</code>
              </p>
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto">
          {hasMessages ? (
            <div className="max-w-4xl mx-auto p-4 space-y-4">
              {chat.messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              <LoadingIndicator isVisible={chat.isLoading} />
              <div ref={messagesEndRef} />
            </div>
          ) : (
            // Welcome screen
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wifi className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Welcome to Ollama Chat
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {hasNoModels 
                    ? "Install an Ollama model to start chatting with local AI"
                    : `Start a conversation with ${chat.selectedModel || 'your AI assistant'}`
                  }
                </p>
                
                {!hasNoModels && (
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>💡 Tips:</p>
                    <ul className="space-y-1 text-left">
                      <li>• Ask questions, request code, or have a conversation</li>
                      <li>• Switch models anytime during the chat</li>
                      <li>• Export your conversations for later reference</li>
                      <li>• All processing happens locally on your machine</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat input */}
        <ChatInput
          onSendMessage={chat.sendMessage}
          isLoading={chat.isLoading}
          onStopGeneration={chat.stopGeneration}
          disabled={hasNoModels || !chat.selectedModel}
        />
      </main>
    </div>
  );
}

export default App;
