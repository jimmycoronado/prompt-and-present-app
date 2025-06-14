import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel';
import { PromptTemplate } from '../types/templates';
import { useIsMobile } from '../hooks/use-mobile';

interface PromptCarouselProps {
  templates: PromptTemplate[];
  onSelectTemplate: (content: string) => void;
}

export const PromptCarousel: React.FC<PromptCarouselProps> = ({ 
  templates, 
  onSelectTemplate 
}) => {
  const [templatesPerView, setTemplatesPerView] = useState(3);
  const isMobile = useIsMobile();

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

  const handleTemplateClick = (template: PromptTemplate) => {
    onSelectTemplate(template.content);
  };

  if (templates.length === 0) return null;

  // ChatGPT-style design
  if (isMobile) {
    return (
      <TooltipProvider delayDuration={300}>
        <div className="w-full px-4 py-4">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {templates.map((template, index) => (
                <CarouselItem key={template.id} className="pl-2 basis-[280px]">
                  <Card 
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 group h-auto"
                    onClick={() => handleTemplateClick(template)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                            {template.name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                          {template.content.length > 120 
                            ? `${template.content.substring(0, 120)}...`
                            : template.content
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </TooltipProvider>
    );
  }

  // Desktop version - keep the existing design
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
            {templates.slice(0, templatesPerView).map((template, index) => (
              <Tooltip key={template.id}>
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
        </div>
      </div>
    </TooltipProvider>
  );
};
