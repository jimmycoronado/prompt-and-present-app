
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
  
  // API real de Azure
  const apiUrl = 'https://jarvis-api-agente-sql.azurewebsites.net/query';
  
  console.log('mockApiCall: Using Azure API URL:', apiUrl);
  
  // Preparar el body según el formato requerido
  const requestBody = {
    pregunta: message,
    correo: userEmail || "jcoronado@skandia.com.co"
  };
  
  console.log('mockApiCall: Request body:', requestBody);
  
  try {
    console.log('mockApiCall: Making POST request to Azure API...');
    
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
      throw new Error(`Error en la API de Azure: ${response.status} - ${response.statusText}. Details: ${errorText}`);
    }

    const apiData: AgentApiResponse = await response.json();
    console.log('mockApiCall: Azure API response data:', apiData);
    
    const processingTime = Date.now() - startTime;
    
    // Procesar la respuesta de la API
    const responseText = apiData.response || apiData.message || 'Respuesta recibida del agente';
    
    console.log('mockApiCall: Final response text created successfully');
    
    // Si la respuesta contiene datos estructurados, intentar procesarlos
    let tableData = null;
    let chartData = null;
    
    // Aquí puedes agregar lógica para detectar y procesar datos tabulares o de gráficos
    // según el formato que devuelva tu API
    
    return {
      text: responseText,
      data: tableData,
      chart: chartData,
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
    
    // Mensaje de error más informativo
    const errorMessage = `❌ Error al conectar con el agente maestro: ${error instanceof Error ? error.message : 'Error desconocido'}. 

Detalles del error:
- Endpoint: ${apiUrl}
- Método: POST
- Tipo de error: ${typeof error}
- Constructor: ${error instanceof Error ? error.constructor.name : 'Desconocido'}

Por favor, inténtalo de nuevo.`;

    return {
      text: errorMessage,
      processingTime: Date.now() - startTime
    };
  }
};
