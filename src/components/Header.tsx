
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { Button } from '@/components/ui/button';
import { MessageSquare, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleSidePanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleSidePanel }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
              src="https://www.skandia.com.mx/mercadeo/2021/campana/Sami/Mail/Sami/Thinking2.gif" 
              alt="Sami Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Super Sami
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hidden sm:flex"
        >
          {theme === 'dark' ? (
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
    </header>
  );
};
