
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { BannerData } from '../types/banner';

const iconMap = {
  TrendingUp,
  Calendar,
  AlertTriangle,
  Target,
  BarChart3,
  CheckSquare
};

const colorMap = {
  blue: 'bg-blue-500 border-blue-200 text-blue-50',
  green: 'bg-green-500 border-green-200 text-green-50',
  yellow: 'bg-yellow-500 border-yellow-200 text-yellow-50',
  red: 'bg-red-500 border-red-200 text-red-50',
  purple: 'bg-purple-500 border-purple-200 text-purple-50',
  indigo: 'bg-indigo-500 border-indigo-200 text-indigo-50'
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
      <div className="w-full bg-gradient-to-r from-skandia-green to-green-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-4 bg-white bg-opacity-30 rounded w-64"></div>
            </div>
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
    <div className={`w-full ${colorClasses} shadow-sm border-b transition-all duration-500`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-shrink-0">
              <IconComponent className="w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="font-semibold text-sm">{currentBanner.title}</h3>
                  <p className="text-sm opacity-90">
                    {currentBanner.message}
                    {currentBanner.value && (
                      <span className="font-bold ml-1">{currentBanner.value}</span>
                    )}
                  </p>
                </div>
                
                {currentBanner.actionText && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-30"
                  >
                    {currentBanner.actionText}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Navegación */}
            {totalBanners > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="h-8 w-8 text-white hover:bg-white hover:bg-opacity-20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalBanners }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => goToBanner(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
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
                  className="h-8 w-8 text-white hover:bg-white hover:bg-opacity-20"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Botón cerrar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
