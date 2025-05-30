
import { useState } from 'react';
import { Template, Plus, Search, Bookmark, Code, FileText, Lightbulb, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { PromptTemplate, TemplateCategory } from '../types/templates';

interface PromptTemplatesProps {
  onSelectTemplate: (template: PromptTemplate) => void;
  onClose: () => void;
}

const defaultCategories: TemplateCategory[] = [
  { id: 'writing', name: 'Escritura', description: 'Plantillas para escribir y redactar', icon: 'FileText' },
  { id: 'coding', name: 'Programación', description: 'Plantillas para desarrollo y código', icon: 'Code' },
  { id: 'analysis', name: 'Análisis', description: 'Plantillas para análisis y evaluación', icon: 'Lightbulb' },
  { id: 'general', name: 'General', description: 'Plantillas de uso general', icon: 'MessageCircle' }
];

const defaultTemplates: PromptTemplate[] = [
  {
    id: '1',
    name: 'Explicar concepto',
    description: 'Explica un concepto de manera simple y clara',
    content: 'Explícame el concepto de {concepto} de manera simple y con ejemplos prácticos. Incluye las ventajas y desventajas si las hay.',
    category: 'general',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: '2',
    name: 'Revisar código',
    description: 'Revisa y mejora código existente',
    content: 'Por favor revisa el siguiente código y sugiere mejoras en términos de legibilidad, rendimiento y mejores prácticas:\n\n{codigo}',
    category: 'coding',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: '3',
    name: 'Redactar email profesional',
    description: 'Ayuda a redactar emails profesionales',
    content: 'Ayúdame a redactar un email profesional para {destinatario} sobre {tema}. El tono debe ser {tono} y el objetivo es {objetivo}.',
    category: 'writing',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: '4',
    name: 'Análisis de datos',
    description: 'Analiza conjuntos de datos y extrae insights',
    content: 'Analiza los siguientes datos y proporciona insights clave, tendencias y recomendaciones:\n\n{datos}',
    category: 'analysis',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  }
];

export const PromptTemplates: React.FC<PromptTemplatesProps> = ({ onSelectTemplate, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templates] = useState<PromptTemplate[]>(defaultTemplates);

  const getIconComponent = (iconName: string) => {
    const icons = { FileText, Code, Lightbulb, MessageCircle };
    return icons[iconName as keyof typeof icons] || MessageCircle;
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: PromptTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Template className="h-5 w-5 mr-2" />
            Plantillas de Prompts
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* TODO: Implementar crear plantilla personalizada */}}
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
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="h-7"
                    >
                      Usar Plantilla
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
