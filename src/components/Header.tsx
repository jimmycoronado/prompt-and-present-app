
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor, Edit3, PanelLeft } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { DynamicBanner } from './DynamicBanner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useConversation } from '@/contexts/ConversationContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onBannerAction?: (automaticReply: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  onBannerAction 
}) => {
  const { user } = useAuth();
  const { isDark, themeMode, toggleTheme } = useTheme();
  const { createNewConversation, currentConversation } = useConversation();
  const isMobile = useIsMobile();

  const handleNewChat = () => {
    createNewConversation();
  };

  const hasActiveConversation = currentConversation !== null;

  // Función para obtener el ícono correcto según el modo del tema
  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'system':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <header className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${isMobile ? 'flex-shrink-0' : ''}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          {/* Botón de panel lateral - solo en móvil, al lado izquierdo del logo */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="md:hidden"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          )}

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
        <div className="hidden lg:flex justify-center px-4 py-2">
          <div className="w-full max-w-4xl">
            <DynamicBanner onClose={() => {}} onBannerAction={onBannerAction} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Botón de tema - siempre visible */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={`Tema actual: ${themeMode === 'system' ? 'Automático' : themeMode === 'dark' ? 'Oscuro' : 'Claro'}`}
          >
            {getThemeIcon()}
          </Button>

          {/* Botón de nueva conversación - solo en móvil cuando hay conversación activa */}
          {isMobile && hasActiveConversation && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="md:hidden"
            >
              <Edit3 className="h-5 w-5" />
            </Button>
          )}

          {user && <UserMenu />}
        </div>
      </div>

      {/* Banner para pantallas medianas, pequeñas y móviles - debajo del header */}
      <div className="px-4 pb-3 lg:hidden">
        <DynamicBanner onClose={() => {}} onBannerAction={onBannerAction} />
      </div>
    </header>
  );
};
