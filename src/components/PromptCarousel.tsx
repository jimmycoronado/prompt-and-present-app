
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, FileText, BarChart3 } from 'lucide-react';
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
        prevIndex === templates.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, templates.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === 0 ? templates.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === templates.length - 1 ? 0 : currentIndex + 1);
  };

  const handleTemplateClick = (template: PromptTemplate) => {
    onSelectTemplate(template.content);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data':
        return <BarChart3 className="w-5 h-5" />;
      case 'writing':
        return <FileText className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'data':
        return 'from-blue-500 to-cyan-500';
      case 'writing':
        return 'from-green-500 to-emerald-500';
      case 'analysis':
        return 'from-purple-500 to-violet-500';
      case 'business':
        return 'from-orange-500 to-amber-500';
      case 'coding':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  if (templates.length === 0) return null;

  const currentTemplate = templates[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Plantillas Sugeridas
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Haz clic en una plantilla para comenzar tu consulta
        </p>
      </div>

      <div className="relative">
        {/* Main carousel card */}
        <Card 
          className="cursor-pointer transition-all duration-300 hover:shadow-lg border-0 overflow-hidden group"
          onClick={() => handleTemplateClick(currentTemplate)}
        >
          <div className={`h-2 bg-gradient-to-r ${getCategoryColor(currentTemplate.category)}`} />
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full bg-gradient-to-r ${getCategoryColor(currentTemplate.category)} text-white flex-shrink-0`}>
                {getCategoryIcon(currentTemplate.category)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {currentTemplate.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {currentTemplate.description}
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                  <code className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {currentTemplate.content.length > 120 
                      ? currentTemplate.content.substring(0, 120) + '...'
                      : currentTemplate.content
                    }
                  </code>
                </div>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {currentTemplate.category}
                  </span>
                  <span className="text-xs text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Clic para usar →
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        {templates.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Dots indicator */}
        {templates.length > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            {templates.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-blue-500 w-6' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resume auto-play button */}
      {!isAutoPlaying && templates.length > 1 && (
        <div className="text-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlaying(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Reanudar reproducción automática
          </Button>
        </div>
      )}
    </div>
  );
};
