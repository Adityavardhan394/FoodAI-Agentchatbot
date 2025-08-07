import React from 'react';
import { Loader2, Bot } from 'lucide-react';

interface LoadingIndicatorProps {
  isVisible: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-green-500 text-white">
        <Bot size={16} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Assistant
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Loader2 className="animate-spin" size={16} />
          <span className="text-sm">Thinking...</span>
          
          {/* Animated dots */}
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};