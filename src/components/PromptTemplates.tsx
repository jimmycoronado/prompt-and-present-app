import { useState, useEffect } from 'react';
import { File, Plus, Search, Bookmark, Code, FileText, Lightbulb, MessageCircle, BarChart, Users, Calculator, Globe, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { PromptTemplate, TemplateCategory } from '../types/templates';
import { templatesService, CreateTemplateRequest } from '../services/templatesService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { CreateTemplateDialog } from './CreateTemplateDialog';

interface PromptTemplatesProps {
  onSelectTemplate: (template: PromptTemplate) => void;
  onClose: () => void;
}

const defaultCategories: TemplateCategory[] = [
  { id: 'writing', name: 'Escritura', description: 'Plantillas para escribir y redactar', icon: 'FileText' },
  { id: 'coding', name: 'Programación', description: 'Plantillas para desarrollo y código', icon: 'Code' },
  { id: 'analysis', name: 'Análisis', description: 'Plantillas para análisis y evaluación', icon: 'Lightbulb' },
  { id: 'data', name: 'Datos', description: 'Plantillas para análisis de datos', icon: 'BarChart' },
  { id: 'business', name: 'Negocios', description: 'Plantillas para contextos empresariales', icon: 'Users' },
  { id: 'general', name: 'General', description: 'Plantillas de uso general', icon: 'MessageCircle' }
];

export const PromptTemplates: React.FC<PromptTemplatesProps> = ({ onSelectTemplate, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const userEmail = user?.email || '';

  // Load templates from backend
  useEffect(() => {
    const loadTemplates = async () => {
      if (!userEmail) {
        console.log('PromptTemplates: No user email, skipping template load');
        return;
      }

      try {
        setIsLoading(true);
        console.log('PromptTemplates: Loading all templates (user + system) from backend for:', userEmail);
        
        // Get all templates (user and system) in one call
        const allTemplates = await templatesService.getUserTemplates(userEmail);
        
        console.log('PromptTemplates: Loaded all templates:', allTemplates.length);
        setTemplates(allTemplates);
      } catch (error) {
        console.error('PromptTemplates: Error loading templates:', error);
        toast({
          title: "Error al cargar plantillas",
          description: "No se pudieron cargar las plantillas desde el servidor",
          variant: "destructive"
        });
        setTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [userEmail, toast]);

  const getIconComponent = (iconName: string) => {
    const icons = { FileText, Code, Lightbulb, MessageCircle, BarChart, Users, Calculator, Globe };
    return icons[iconName as keyof typeof icons] || MessageCircle;
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (template: PromptTemplate) => {
    console.log('PromptTemplates: Using template:', template.id);
    
    // Record template usage
    if (userEmail && template.id) {
      try {
        await templatesService.recordTemplateUsage(userEmail, template.id);
      } catch (error) {
        console.error('PromptTemplates: Error recording template usage:', error);
      }
    }
    
    onSelectTemplate(template);
    onClose();
  };

  const handleDeleteTemplate = async (template: PromptTemplate) => {
    if (!userEmail || template.isDefault) {
      toast({
        title: "No se puede eliminar",
        description: "Las plantillas del sistema no se pueden eliminar",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('PromptTemplates: Deleting template:', template.id);
      await templatesService.deleteTemplate(userEmail, template.id);
      
      // Remove from local state
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla se eliminó correctamente"
      });
    } catch (error) {
      console.error('PromptTemplates: Error deleting template:', error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la plantilla",
        variant: "destructive"
      });
    }
  };

  const handleCreateTemplate = async (templateData: CreateTemplateRequest) => {
    if (!userEmail) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear plantillas",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('PromptTemplates: Creating new template:', templateData);
      const newTemplate = await templatesService.createTemplate(userEmail, templateData);
      
      // Add to local state
      setTemplates(prev => [newTemplate, ...prev]);
      
      toast({
        title: "Plantilla creada",
        description: "La plantilla se creó correctamente"
      });
    } catch (error) {
      console.error('PromptTemplates: Error creating template:', error);
      toast({
        title: "Error al crear plantilla",
        description: "No se pudo crear la plantilla",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Cerrar plantillas"
      >
        <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </button>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center pr-8">
            <File className="h-5 w-5 mr-2" />
            Plantillas de Prompts
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Plantilla
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar plantillas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Todas
            </Button>
            {defaultCategories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <IconComponent className="h-3 w-3 mr-1" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Cargando plantillas...
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No se encontraron plantillas
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {template.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Bookmark className="h-2 w-2 mr-1" />
                            Por defecto
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {defaultCategories.find(c => c.id === template.category)?.name}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 mb-3">
                      <code className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {template.content.length > 150 
                          ? template.content.substring(0, 150) + '...'
                          : template.content
                        }
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Usado {template.usageCount} veces
                      </span>
                      <div className="flex space-x-2">
                        {!template.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template)}
                            className="h-7 text-red-600 hover:text-red-700"
                          >
                            Eliminar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                          className="h-7"
                        >
                          Usar Plantilla
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </ScrollArea>

      {/* Create Template Dialog */}
      <CreateTemplateDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateTemplate}
        categories={defaultCategories}
      />
    </div>
  );
};
