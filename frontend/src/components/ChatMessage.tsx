import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '../types';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-gray-50 dark:bg-gray-800/50'} rounded-lg`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-green-500 text-white'
      }`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {isUser ? 'You' : 'Assistant'}
          </span>
          {message.timestamp && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {message.timestamp.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="relative group">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {isUser ? (
              <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                {message.content}
              </p>
            ) : (
              <div className="text-gray-900 dark:text-gray-100">
                <ReactMarkdown
                  components={{
                  code: ({ className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    const isInline = !match;
                    
                    if (isInline) {
                      return (
                        <code
                          className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1 py-0.5 rounded text-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    
                    return (
                      <div className="relative">
                        <pre className="bg-gray-900 dark:bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
                          <code className={`language-${language}`} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  },
                  blockquote: ({ children }: any) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300">
                      {children}
                    </blockquote>
                  ),
                  h1: ({ children }: any) => (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }: any) => (
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }: any) => (
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }: any) => (
                    <ul className="list-disc pl-6 text-gray-900 dark:text-gray-100">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }: any) => (
                    <ol className="list-decimal pl-6 text-gray-900 dark:text-gray-100">
                      {children}
                    </ol>
                  ),
                  p: ({ children }: any) => (
                    <p className="text-gray-900 dark:text-gray-100 mb-2">
                      {children}
                    </p>
                  ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {message.content && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-1.5 rounded text-gray-600 dark:text-gray-300"
              title="Copy message"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};