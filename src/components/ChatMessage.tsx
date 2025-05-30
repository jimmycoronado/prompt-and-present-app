
import { User, Bot, Clock, Download } from "lucide-react";
import { ChatMessage as ChatMessageType } from "../types/chat";
import { DataTable } from "./DataTable";
import { DataChart } from "./DataChart";
import { Button } from "./ui/button";

interface ChatMessageProps {
  message: ChatMessageType;
  isSelected: boolean;
  onClick: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isSelected, onClick }) => {
  const isUser = message.type === 'user';

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2' : ''
      }`}
      onClick={onClick}
    >
      <div className={`max-w-4xl w-full ${isUser ? 'flex flex-row-reverse' : 'flex'} space-x-3 space-x-reverse`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-600 dark:bg-gray-500 text-white'
          }`}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block rounded-lg p-4 shadow-sm border ${
            isUser
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700'
          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
            
            {/* Text Content */}
            {message.content && (
              <div className="whitespace-pre-wrap">
                {message.content}
              </div>
            )}

            {/* Files */}
            {message.files && message.files.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.files.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 p-2 rounded ${
                      isUser 
                        ? 'bg-blue-500' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs opacity-75">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Data Table */}
            {message.data && (
              <div className="mt-4">
                <DataTable data={message.data} />
              </div>
            )}

            {/* Chart */}
            {message.chart && (
              <div className="mt-4">
                <DataChart chartData={message.chart} />
              </div>
            )}

            {/* Download Link */}
            {message.downloadLink && (
              <div className="mt-4">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <a href={message.downloadLink.url} download>
                    <Download className="h-4 w-4 mr-2" />
                    {message.downloadLink.filename}
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className={`mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <Clock className="h-3 w-3 mr-1" />
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};
