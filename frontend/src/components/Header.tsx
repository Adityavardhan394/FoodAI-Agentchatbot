import React from 'react';
import { Model } from '../types';
import { 
  Sun, 
  Moon, 
  Trash2, 
  Download, 
  RefreshCw, 
  Bot,
  ChevronDown 
} from 'lucide-react';

interface HeaderProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (modelName: string) => void;
  onClearChat: () => void;
  onExportChat: (format: 'txt' | 'md') => void;
  onRefreshModels: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  messageCount: number;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  models,
  selectedModel,
  onModelChange,
  onClearChat,
  onExportChat,
  onRefreshModels,
  theme,
  onToggleTheme,
  messageCount,
  isLoading
}) => {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Model Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <Bot className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Ollama Chat
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Local AI Assistant
                </p>
              </div>
            </div>

            {/* Model Selector */}
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-w-[200px]"
                disabled={isLoading}
              >
                {models.length === 0 ? (
                  <option value="">No models available</option>
                ) : (
                  models.map((model) => (
                    <option key={model.name} value={model.name}>
                      {model.name}
                      {model.size && ` (${model.size})`}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown 
                size={16} 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none"
              />
            </div>

            <button
              onClick={onRefreshModels}
              disabled={isLoading}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh models"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Message count */}
            {messageCount > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                {messageCount} messages
              </span>
            )}

            {/* Export dropdown */}
            {messageCount > 0 && (
              <div className="relative group">
                <button
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Export chat"
                >
                  <Download size={16} />
                  <span>Export</span>
                  <ChevronDown size={12} />
                </button>
                
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10">
                  <button
                    onClick={() => onExportChat('md')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                  >
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => onExportChat('txt')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                  >
                    Text (.txt)
                  </button>
                </div>
              </div>
            )}

            {/* Clear chat */}
            {messageCount > 0 && (
              <button
                onClick={onClearChat}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Clear chat"
              >
                <Trash2 size={16} />
                <span>Clear</span>
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        {/* Status indicator */}
        {selectedModel && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connected to {selectedModel}</span>
            {isLoading && (
              <>
                <span>•</span>
                <span className="text-blue-500 dark:text-blue-400">Generating...</span>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};