import { PromptTemplate } from '../types/templates';

const BACKEND_URL = 'https://skcodaliaidev.azurewebsites.net';

export interface CreateTemplateRequest {
  name: string;
  description: string;
  content: string;
  category: string;
  tags?: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export interface TemplateCategory {
  category: string;
  count: number;
}

export interface CategoriesResponse {
  user_id: string;
  categories: TemplateCategory[];
}

class TemplatesService {
  private getHeaders(userEmail?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (userEmail) {
      headers['X-User-Id'] = userEmail;
    }
    
    return headers;
  }

  async getUserTemplates(userEmail: string, options?: {
    category?: string;
    isDefault?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PromptTemplate[]> {
    try {
      console.log('TemplatesService: Getting user templates for:', userEmail, 'options:', options);
      
      // For system templates (isDefault: true), use "system" as user_id
      // For user templates (isDefault: false or undefined), use the user's email
      const userId = options?.isDefault === true ? 'system' : userEmail;
      
      const params = new URLSearchParams({
        user_id: userId,
        ...(options?.category && { category: options.category }),
        ...(options?.isDefault !== undefined && { is_default: options.isDefault.toString() }),
        ...(options?.search && { search: options.search }),
        ...(options?.limit && { limit: options.limit.toString() }),
        ...(options?.offset && { offset: options.offset.toString() })
      });

      console.log('TemplatesService: Making request to:', `${BACKEND_URL}/api/templates?${params}`);

      const response = await fetch(`${BACKEND_URL}/api/templates?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error('TemplatesService: Response not OK:', response.status, response.statusText);
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }

      const templates = await response.json();
      console.log('TemplatesService: Received templates:', templates.length, 'for userId:', userId);
      
      // Convert from backend format to frontend format
      return templates.map((template: any) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        content: template.content,
        category: template.category,
        isDefault: template.isDefault || false,
        createdAt: new Date(template.createdAt),
        usageCount: template.usageCount || 0,
        tags: template.tags || []
      }));
    } catch (error) {
      console.error('TemplatesService: Error fetching templates:', error);
      throw error;
    }
  }

  async createTemplate(userEmail: string, templateData: CreateTemplateRequest): Promise<PromptTemplate> {
    try {
      console.log('TemplatesService: Creating template for:', userEmail);
      
      const response = await fetch(`${BACKEND_URL}/api/templates`, {
        method: 'POST',
        headers: this.getHeaders(userEmail),
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create template: ${response.statusText}`);
      }

      const template = await response.json();
      console.log('TemplatesService: Template created:', template.id);
      
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        content: template.content,
        category: template.category,
        isDefault: false,
        createdAt: new Date(template.createdAt),
        usageCount: 0,
        tags: template.tags || []
      };
    } catch (error) {
      console.error('TemplatesService: Error creating template:', error);
      throw error;
    }
  }

  async updateTemplate(userEmail: string, templateId: string, templateData: UpdateTemplateRequest): Promise<PromptTemplate> {
    try {
      console.log('TemplatesService: Updating template:', templateId);
      
      const response = await fetch(`${BACKEND_URL}/api/templates/${templateId}`, {
        method: 'PUT',
        headers: this.getHeaders(userEmail),
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update template: ${response.statusText}`);
      }

      const template = await response.json();
      console.log('TemplatesService: Template updated:', template.id);
      
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        content: template.content,
        category: template.category,
        isDefault: template.isDefault || false,
        createdAt: new Date(template.createdAt),
        usageCount: template.usageCount || 0,
        tags: template.tags || []
      };
    } catch (error) {
      console.error('TemplatesService: Error updating template:', error);
      throw error;
    }
  }

  async deleteTemplate(userEmail: string, templateId: string): Promise<void> {
    try {
      console.log('TemplatesService: Deleting template:', templateId);
      
      const response = await fetch(`${BACKEND_URL}/api/templates/${templateId}`, {
        method: 'DELETE',
        headers: this.getHeaders(userEmail)
      });

      if (!response.ok) {
        throw new Error(`Failed to delete template: ${response.statusText}`);
      }

      console.log('TemplatesService: Template deleted successfully');
    } catch (error) {
      console.error('TemplatesService: Error deleting template:', error);
      throw error;
    }
  }

  async recordTemplateUsage(userEmail: string, templateId: string): Promise<void> {
    try {
      console.log('TemplatesService: Recording template usage:', templateId);
      
      const response = await fetch(`${BACKEND_URL}/api/templates/${templateId}/usage`, {
        method: 'POST',
        headers: this.getHeaders(userEmail)
      });

      if (!response.ok) {
        throw new Error(`Failed to record template usage: ${response.statusText}`);
      }

      console.log('TemplatesService: Template usage recorded');
    } catch (error) {
      console.error('TemplatesService: Error recording template usage:', error);
      // Don't throw error for usage tracking as it's not critical
    }
  }

  async getTemplateCategories(userEmail: string): Promise<CategoriesResponse> {
    try {
      console.log('TemplatesService: Getting template categories for:', userEmail);
      
      const params = new URLSearchParams({
        user_id: userEmail
      });

      const response = await fetch(`${BACKEND_URL}/api/templates/categories?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const categories = await response.json();
      console.log('TemplatesService: Received categories:', categories);
      
      return categories;
    } catch (error) {
      console.error('TemplatesService: Error fetching categories:', error);
      throw error;
    }
  }
}

export const templatesService = new TemplatesService();
