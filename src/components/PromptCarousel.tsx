
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
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
  const [templatesPerView, setTemplatesPerView] = useState(3);

  // Responsive templates per view
  useEffect(() => {
    const updateTemplatesPerView = () => {
      if (window.innerWidth < 640) {
        setTemplatesPerView(1); // sm breakpoint
      } else if (window.innerWidth < 1024) {
        setTemplatesPerView(2); // lg breakpoint
      } else {
        setTemplatesPerView(3); // lg and above
      }
    };

    updateTemplatesPerView();
    window.addEventListener('resize', updateTemplatesPerView);
    return () => window.removeEventListener('resize', updateTemplatesPerView);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || templates.length === 0) return;

    const maxIndex = Math.max(0, templates.length - templatesPerView);
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= maxIndex ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, templates.length, templatesPerView]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    const maxIndex = Math.max(0, templates.length - templatesPerView);
    setCurrentIndex(currentIndex === 0 ? maxIndex : currentIndex - 1);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    const maxIndex = Math.max(0, templates.length - templatesPerView);
    setCurrentIndex(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  };

  const handleTemplateClick = (template: PromptTemplate) => {
    onSelectTemplate(template.content);
  };

  if (templates.length === 0) return null;

  // Get visible templates based on current index and templates per view
  const visibleTemplates = templates.slice(currentIndex, currentIndex + templatesPerView);
  if (visibleTemplates.length < templatesPerView && templates.length > templatesPerView) {
    // Fill remaining slots from the beginning
    const remaining = templatesPerView - visibleTemplates.length;
    visibleTemplates.push(...templates.slice(0, remaining));
  }

  const maxIndex = Math.max(0, templates.length - templatesPerView);
  const showNavigation = templates.length > templatesPerView;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full max-w-5xl mx-auto px-4 py-4">
        <div className="relative">
          {/* Templates Grid - responsive */}
          <div className={`grid gap-4 ${
            templatesPerView === 1 ? 'grid-cols-1' :
            templatesPerView === 2 ? 'grid-cols-2' :
            'grid-cols-3'
          }`}>
            {visibleTemplates.map((template, index) => (
              <Tooltip key={`${template.id}-${index}`}>
                <TooltipTrigger asChild>
                  <Card 
                    className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 group h-20"
                    onClick={() => handleTemplateClick(template)}
                  >
                    <CardContent className="p-3 h-full flex flex-col justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1.5 line-clamp-1">
                          {template.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-tight">
                          {template.content.length > 60 
                            ? `${template.content.substring(0, 60)}...`
                            : template.content
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="max-w-xs p-3 text-sm bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 border border-gray-700"
                >
                  <div className="space-y-2">
                    <p className="font-medium">{template.name}</p>
                    <p className="text-xs opacity-90 leading-relaxed">{template.content}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Navigation buttons */}
          {showNavigation && (
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

          {/* Dots indicator */}
          {showNavigation && (
            <div className="flex justify-center space-x-1 mt-4">
              {Array.from({ length: Math.ceil(templates.length / templatesPerView) }, (_, index) => (
                <button
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    Math.floor(currentIndex / templatesPerView) === index 
                      ? 'bg-gray-400 dark:bg-gray-500' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => {
                    setCurrentIndex(index * templatesPerView);
                    setIsAutoPlaying(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Resume auto-play button */}
        {!isAutoPlaying && showNavigation && (
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
    </TooltipProvider>
  );
};
