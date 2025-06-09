
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { PromptTemplate } from '../types/templates';

interface PromptCarouselProps {
  templates: PromptTemplate[];
  onSelectTemplate: (content: string) => void;
}

export const PromptCarousel: React.FC<PromptCarouselProps> = ({ 
  templates, 
  onSelectTemplate 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || templates.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= templates.length - 3 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, templates.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === 0 ? Math.max(0, templates.length - 3) : currentIndex - 1);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex >= templates.length - 3 ? 0 : currentIndex + 1);
  };

  const handleTemplateClick = (template: PromptTemplate) => {
    onSelectTemplate(template.content);
  };

  if (templates.length === 0) return null;

  // Show 3 templates at a time, or all if less than 3
  const visibleTemplates = templates.slice(currentIndex, currentIndex + 3);
  if (visibleTemplates.length < 3 && templates.length > 3) {
    // Fill remaining slots from the beginning
    const remaining = 3 - visibleTemplates.length;
    visibleTemplates.push(...templates.slice(0, remaining));
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
          Plantillas Sugeridas
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Haz clic en una plantilla para comenzar
        </p>
      </div>

      <div className="relative">
        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleTemplates.map((template, index) => (
            <Card 
              key={`${template.id}-${index}`}
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 group h-32"
              onClick={() => handleTemplateClick(template)}
            >
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {template.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {template.category}
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                    Usar →
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation buttons - only show if more than 3 templates */}
        {templates.length > 3 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 h-8 w-8 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 h-8 w-8 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Subtle dots indicator */}
        {templates.length > 3 && (
          <div className="flex justify-center space-x-1 mt-4">
            {Array.from({ length: Math.ceil(templates.length / 3) }, (_, index) => (
              <button
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  Math.floor(currentIndex / 3) === index 
                    ? 'bg-gray-400 dark:bg-gray-500' 
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => {
                  setCurrentIndex(index * 3);
                  setIsAutoPlaying(false);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resume auto-play button */}
      {!isAutoPlaying && templates.length > 3 && (
        <div className="text-center mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlaying(true)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 h-6"
          >
            Reanudar reproducción automática
          </Button>
        </div>
      )}
    </div>
  );
};
