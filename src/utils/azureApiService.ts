
import { AISettings } from "../types/settings";

interface AzureApiResponse {
  text?: string;
  data?: any;
  chart?: any;
  downloadLink?: { url: string; filename: string };
  videoPreview?: any;
  processingTime?: number;
}

export const callAzureAgentApi = async (
  message: string, 
  files: File[], 
  settings: AISettings,
  userEmail: string
): Promise<AzureApiResponse> => {
  console.log('azureApiService: Starting call to Azure API with message:', message);
  console.log('azureApiService: User email:', userEmail);
  console.log('azureApiService: Files count:', files.length);
  
  const startTime = Date.now();
  
  // Preparar el body para tu API
  const requestBody = {
    pregunta: message,
    correo: userEmail
  };

  console.log('azureApiService: Request body:', requestBody);

  try {
    // Intentar conexión directa primero (ahora que CORS está configurado)
    console.log('azureApiService: Attempting direct connection to Azure API...');
    const response = await fetch('https://jarvis-api-agente-sql.azurewebsites.net/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('azureApiService: Direct API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('azureApiService: Direct API error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const apiData = await response.json();
    console.log('azureApiService: API response data:', apiData);
    
    const processingTime = Date.now() - startTime;
    
    // Procesar la respuesta de tu API
    let responseText = '';
    let tableData = undefined;
    let chartData = undefined;

    // Si la respuesta es un array (como en tu caso)
    if (Array.isArray(apiData)) {
      console.log('azureApiService: Processing array response with', apiData.length, 'items');
      
      // Crear mensaje descriptivo
      responseText = `Se encontraron ${apiData.length} registros:`;
      
      // Crear datos para la tabla
      if (apiData.length > 0) {
        const headers = Object.keys(apiData[0]);
        const rows = apiData.map((item: any) => Object.values(item));
        
        tableData = {
          headers,
          rows
        };
        
        console.log('azureApiService: Created table data with headers:', headers);
        console.log('azureApiService: Table rows count:', rows.length);
      }
    } 
    // Si la respuesta es un objeto con propiedades específicas
    else if (typeof apiData === 'object' && apiData !== null) {
      console.log('azureApiService: Processing object response');
      
      // Buscar texto de respuesta en diferentes campos posibles
      responseText = apiData.respuesta || 
                   apiData.text || 
                   apiData.message || 
                   apiData.resultado ||
                   'Respuesta recibida del agente';
      
      // Si hay datos estructurados
      if (apiData.data && Array.isArray(apiData.data)) {
        const headers = Object.keys(apiData.data[0] || {});
        const rows = apiData.data.map((row: any) => Object.values(row));
        
        tableData = {
          headers,
          rows
        };
      }
      
      // Procesar gráficas si las hay
      if (apiData.chart || apiData.grafica) {
        chartData = apiData.chart || apiData.grafica;
      }
    }
    // Si la respuesta es texto simple
    else {
      responseText = String(apiData) || 'Respuesta recibida del agente';
    }

    return {
      text: responseText,
      data: tableData,
      chart: chartData,
      processingTime
    };
    
  } catch (error) {
    console.error('azureApiService: Error calling Azure API:', error);
    
    const errorMessage = `❌ Error al conectar con el agente: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, inténtalo de nuevo.`;

    return {
      text: errorMessage,
      processingTime: Date.now() - startTime
    };
  }
};
