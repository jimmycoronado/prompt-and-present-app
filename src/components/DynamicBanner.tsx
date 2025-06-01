
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { useBannerData } from '../hooks/useBannerData';

interface DynamicBannerProps {
  onClose: () => void;
  onBannerAction?: (automaticReply: string) => void;
}

export const DynamicBanner: React.FC<DynamicBannerProps> = ({ onClose, onBannerAction }) => {
  const { 
    currentBanner, 
    currentBannerIndex, 
    totalBanners, 
    isLoading, 
    goToNext, 
    goToPrevious, 
    goToBanner 
  } = useBannerData();

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-skandia-green to-green-600 text-white rounded-lg px-3 py-2 sm:px-4">
        <div className="flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-4 bg-white bg-opacity-30 rounded w-32 sm:w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentBanner || totalBanners === 0) {
    return null;
  }

  const handleButtonClick = () => {
    if (onBannerAction && currentBanner.automaticReply) {
      onBannerAction(currentBanner.automaticReply);
    }
  };

  return (
    <div 
      className="rounded-lg px-3 py-2 sm:px-4 shadow-sm transition-all duration-500"
      style={{ 
        backgroundColor: currentBanner.backgroundColor,
        color: currentBanner.textColor
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {currentBanner.iconUrl ? (
              <img 
                src={currentBanner.iconUrl} 
                alt={currentBanner.title}
                className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                onError={(e) => {
                  // Fallback to a default icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <ImageIcon 
              className={`w-4 h-4 sm:w-5 sm:h-5 ${currentBanner.iconUrl ? 'hidden' : ''}`} 
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-xs sm:text-sm truncate">{currentBanner.title}</h3>
                <p className="text-xs opacity-90 truncate">
                  {currentBanner.message}
                </p>
              </div>
              
              {currentBanner.buttonText && (
                <Button 
                  onClick={handleButtonClick}
                  variant="secondary" 
                  size="sm"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 border-white border-opacity-30 text-xs px-2 py-1 h-auto flex-shrink-0 mt-1 sm:mt-0"
                  style={{ color: currentBanner.textColor }}
                >
                  {currentBanner.buttonText}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
          {/* Navegación */}
          {totalBanners > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-white hover:bg-opacity-20"
                style={{ color: currentBanner.textColor }}
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              
              <div className="hidden sm:flex space-x-1">
                {Array.from({ length: totalBanners }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => goToBanner(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentBannerIndex 
                        ? 'opacity-100' 
                        : 'opacity-50'
                    }`}
                    style={{ backgroundColor: currentBanner.textColor }}
                  />
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-white hover:bg-opacity-20"
                style={{ color: currentBanner.textColor }}
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
