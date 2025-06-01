
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  Target, 
  BarChart3, 
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useBannerData } from '../hooks/useBannerData';

const iconMap = {
  TrendingUp,
  Calendar,
  AlertTriangle,
  Target,
  BarChart3,
  CheckSquare
};

const colorMap = {
  blue: 'bg-blue-500 text-blue-50',
  green: 'bg-green-500 text-green-50',
  yellow: 'bg-yellow-500 text-yellow-50',
  red: 'bg-red-500 text-red-50',
  purple: 'bg-purple-500 text-purple-50',
  indigo: 'bg-indigo-500 text-indigo-50'
};

interface DynamicBannerProps {
  onClose: () => void;
}

export const DynamicBanner: React.FC<DynamicBannerProps> = ({ onClose }) => {
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
      <div className="bg-gradient-to-r from-skandia-green to-green-600 text-white rounded-lg px-4 py-2">
        <div className="flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-4 bg-white bg-opacity-30 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentBanner || totalBanners === 0) {
    return null;
  }

  const IconComponent = iconMap[currentBanner.icon as keyof typeof iconMap] || TrendingUp;
  const colorClasses = colorMap[currentBanner.color || 'blue'];

  return (
    <div className={`${colorClasses} rounded-lg px-4 py-2 shadow-sm transition-all duration-500`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <IconComponent className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-4">
              <div className="min-w-0">
                <h3 className="font-medium text-sm truncate">{currentBanner.title}</h3>
                <p className="text-xs opacity-90 truncate">
                  {currentBanner.message}
                  {currentBanner.value && (
                    <span className="font-semibold ml-1">{currentBanner.value}</span>
                  )}
                </p>
              </div>
              
              {currentBanner.actionText && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-30 text-xs px-2 py-1 h-auto flex-shrink-0"
                >
                  {currentBanner.actionText}
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
                className="h-6 w-6 text-white hover:bg-white hover:bg-opacity-20"
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalBanners }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => goToBanner(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentBannerIndex 
                        ? 'bg-white' 
                        : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="h-6 w-6 text-white hover:bg-white hover:bg-opacity-20"
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
