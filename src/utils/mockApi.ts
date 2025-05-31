
import { AISettings } from "../types/settings";

interface AgentApiResponse {
  response?: string;
  message?: string;
  error?: string;
  clientes_nuevos_mes_actual?: number;
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
  
  // Usar función edge de Supabase como proxy para evitar problemas de CORS
  const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/azure-agent-proxy`;
  
  console.log('mockApiCall: Using Supabase proxy URL:', proxyUrl);
  
  // Preparar el body según el formato requerido
  const requestBody = {
    pregunta: message,
    correo: userEmail || "jcoronado@skandia.com.co"
  };
  
  console.log('mockApiCall: Request body:', requestBody);
  
  try {
    console.log('mockApiCall: Making POST request through Supabase proxy...');
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(requestBody)
    });

    console.log('mockApiCall: Fetch completed, response status:', response.status);
    console.log('mockApiCall: Response ok:', response.ok);
    console.log('mockApiCall: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('mockApiCall: Response not ok, error text:', errorText);
      throw new Error(`Error en el proxy de Supabase: ${response.status} - ${response.statusText}. Details: ${errorText}`);
    }

    const apiData: AgentApiResponse = await response.json();
    console.log('mockApiCall: Azure API response data through proxy:', apiData);
    
    const processingTime = Date.now() - startTime;
    
    // Procesar la respuesta de la API
    let responseText = apiData.response || apiData.message || 'Respuesta recibida del agente';
    
    // Si hay un error en la respuesta de la API
    if (apiData.error) {
      responseText = `❌ Error del agente: ${apiData.error}`;
    }
    
    console.log('mockApiCall: Final response text created successfully');
    
    // Si la respuesta contiene datos estructurados, intentar procesarlos
    let tableData = null;
    let chartData = null;
    
    // Verificar si hay datos numéricos para crear una tabla
    if (apiData.clientes_nuevos_mes_actual !== undefined) {
      tableData = {
        headers: ['Métrica', 'Valor'],
        rows: [
          ['Clientes nuevos mes actual', apiData.clientes_nuevos_mes_actual.toString()]
        ]
      };
    }
    
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
- Proxy: ${proxyUrl}
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
