
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './ui/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
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
  const [api, setApi] = useState<any>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const isMobile = useIsMobile();
  const carouselRef = useRef<HTMLDivElement>(null);

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

  // Update scroll state when API changes
  useEffect(() => {
    if (!api) return;

    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateScrollState();
    api.on('select', updateScrollState);
    api.on('reInit', updateScrollState);

    return () => {
      api.off('select', updateScrollState);
      api.off('reInit', updateScrollState);
    };
  }, [api]);

  // Mouse wheel scroll for desktop
  useEffect(() => {
    if (!carouselRef.current || isMobile) return;

    const handleWheel = (e: WheelEvent) => {
      if (!api) return;
      
      // Only handle horizontal scroll or when shift is pressed
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        e.preventDefault();
        
        if (e.deltaX > 0 || (e.shiftKey && e.deltaY > 0)) {
          api.scrollNext();
        } else if (e.deltaX < 0 || (e.shiftKey && e.deltaY < 0)) {
          api.scrollPrev();
        }
      }
    };

    const carousel = carouselRef.current;
    carousel.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      carousel.removeEventListener('wheel', handleWheel);
    };
  }, [api, isMobile]);

  const handleTemplateClick = (template: PromptTemplate) => {
    onSelectTemplate(template.content);
  };

  if (templates.length === 0) return null;

  // Mobile version with swipe
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

  // Desktop version with navigation buttons and mouse wheel scroll
  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full max-w-5xl mx-auto px-4 py-4">
        <div ref={carouselRef} className="relative group">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            setApi={setApi}
            className="w-full"
          >
            {/* Navigation buttons - only visible on desktop and on hover */}
            {canScrollPrev && (
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => api?.scrollPrev()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            
            {canScrollNext && (
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => api?.scrollNext()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            <CarouselContent className="-ml-4">
              {templates.map((template, index) => (
                <CarouselItem key={template.id} className="pl-4 basis-[280px]">
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </TooltipProvider>
  );
};
