
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { Button } from '@/components/ui/button';
import { MessageSquare, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { DynamicBanner } from './DynamicBanner';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleSidePanel?: () => void;
  onBannerAction?: (automaticReply: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  onToggleSidePanel, 
  onBannerAction 
}) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-skandia-green p-1 overflow-hidden">
              <img 
                src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DaliLogo.jpg" 
                alt="Dali AI Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Dali AI
            </h1>
          </div>
        </div>

        {/* Banner dinámico en el centro - solo en pantallas grandes */}
        <div className="hidden lg:flex justify-center px-4 py-8">
          <div className="w-full max-w-4xl">
            <DynamicBanner onClose={() => {}} onBannerAction={onBannerAction} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden sm:flex"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {onToggleSidePanel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidePanel}
              className="hidden sm:flex"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          )}

          {user && <UserMenu />}
        </div>
      </div>

      {/* Banner para pantallas medianas y pequeñas - debajo del header */}
      <div className="px-4 pb-3 lg:hidden">
        <DynamicBanner onClose={() => {}} onBannerAction={onBannerAction} />
      </div>
    </header>
  );
};
