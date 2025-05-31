
import { AISettings } from "../types/settings";

interface AgentApiResponse {
  response?: string;
  message?: string;
  error?: string;
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
    // Llamar a tu API de agente maestro
    const response = await fetch('https://jarvis-api-agente-sql.azurewebsites.net/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pregunta: message,
        correo: userEmail || 'usuario@ejemplo.com' // fallback si no hay email
      })
    });

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} - ${response.statusText}`);
    }

    const data: AgentApiResponse = await response.json();
    console.log('mockApiCall: API response:', data);
    
    const processingTime = Date.now() - startTime;
    
    // Extraer el texto de respuesta - ahora maneja tanto "response" como "message"
    const responseText = data.response || data.message || 'No se recibió respuesta del agente';
    
    return {
      text: responseText,
      processingTime
    };
    
  } catch (error) {
    console.error('mockApiCall: Error calling agent API:', error);
    
    // Fallback en caso de error
    return {
      text: `Lo siento, hubo un error al conectar con el agente maestro: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, inténtalo de nuevo.`,
      processingTime: Date.now() - startTime
    };
  }
};
