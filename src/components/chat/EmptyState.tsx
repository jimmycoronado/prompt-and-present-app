
import { PromptCarousel } from "../PromptCarousel";
import { PromptTemplate } from "../../types/templates";

interface EmptyStateProps {
  templates: PromptTemplate[];
  onSelectTemplate: (content: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  templates, 
  onSelectTemplate 
}) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-transparent overflow-hidden">
        <img 
          src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DaliLogo.gif" 
          alt="Dali AI Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
        ¡Hola! ¿En qué puedo ayudarte hoy?
      </h3>
      
      {/* Templates Carousel - show user templates or default ones */}
      {templates.length > 0 && (
        <PromptCarousel
          templates={templates}
          onSelectTemplate={onSelectTemplate}
        />
      )}
    </div>
  );
};
