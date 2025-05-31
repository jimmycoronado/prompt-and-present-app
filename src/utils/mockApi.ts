
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
  const apiUrl = 'https://jarvis-api-agente-sql.azurewebsites.net/query';
  const requestBody = {
    pregunta: message,
    correo: userEmail || 'usuario@ejemplo.com'
  };
  
  console.log('mockApiCall: API URL:', apiUrl);
  console.log('mockApiCall: Request body:', requestBody);
  
  try {
    console.log('mockApiCall: Making fetch request...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('mockApiCall: Fetch completed, response status:', response.status);
    console.log('mockApiCall: Response ok:', response.ok);
    console.log('mockApiCall: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('mockApiCall: Response not ok, error text:', errorText);
      throw new Error(`Error en la API: ${response.status} - ${response.statusText}. Details: ${errorText}`);
    }

    const data: AgentApiResponse = await response.json();
    console.log('mockApiCall: API response data:', data);
    
    const processingTime = Date.now() - startTime;
    
    // Extraer el texto de respuesta - ahora maneja tanto "response" como "message"
    const responseText = data.response || data.message || 'No se recibió respuesta del agente';
    
    console.log('mockApiCall: Final response text:', responseText);
    
    return {
      text: responseText,
      processingTime
    };
    
  } catch (error) {
    console.error('mockApiCall: Error in try-catch block:', error);
    console.error('mockApiCall: Error type:', typeof error);
    console.error('mockApiCall: Error constructor:', error.constructor.name);
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('mockApiCall: This is a network connectivity issue');
      console.error('mockApiCall: Possible causes: CORS, server down, network issues');
    }
    
    // Fallback en caso de error
    const errorMessage = `Lo siento, hubo un error al conectar con el agente maestro: ${error instanceof Error ? error.message : 'Error desconocido'}. 

Posibles causas:
- El servidor puede estar temporalmente inactivo
- Problemas de CORS (el servidor no permite solicitudes desde este dominio)
- Problemas de conectividad de red

Por favor, inténtalo de nuevo en unos momentos.`;

    return {
      text: errorMessage,
      processingTime: Date.now() - startTime
    };
  }
};
