
import { AISettings } from "../types/settings";

interface JSONPlaceholderPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export const mockApiCall = async (
  message: string, 
  files: File[], 
  settings: AISettings,
  userEmail?: string
): Promise<{
  text: string;
  data?: any;
  chart?: any;
  downloadLink?: { url: string; filename: string };
  processingTime?: number;
}> => {
  console.log('mockApiCall: Starting with message:', message);
  console.log('mockApiCall: User email:', userEmail);
  
  const startTime = Date.now();
  
  try {
    console.log('mockApiCall: Making request to JSONPlaceholder API...');
    
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    
    console.log('mockApiCall: Response status:', response.status);
    console.log('mockApiCall: Response ok:', response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts: JSONPlaceholderPost[] = await response.json();
    console.log('mockApiCall: API response data:', posts);
    
    const processingTime = Date.now() - startTime;
    
    // Crear respuesta basada en la pregunta
    let responseText = `He procesado tu consulta: "${message}"\n\n`;
    responseText += `Encontré ${posts.length} registros de ejemplo. Aquí tienes algunos datos de muestra:`;
    
    // Transformar datos para la tabla
    const tableData = {
      headers: ['ID', 'Usuario', 'Título', 'Contenido'],
      rows: posts.map(post => [
        post.id.toString(),
        `Usuario ${post.userId}`,
        post.title.substring(0, 30) + '...',
        post.body.substring(0, 50) + '...'
      ])
    };
    
    console.log('mockApiCall: Created table data:', tableData);
    
    return {
      text: responseText,
      data: tableData,
      processingTime
    };
    
  } catch (error) {
    console.error('mockApiCall: Error:', error);
    
    const errorMessage = `❌ Error al conectar con el servicio: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, inténtalo de nuevo.`;

    return {
      text: errorMessage,
      processingTime: Date.now() - startTime
    };
  }
};
