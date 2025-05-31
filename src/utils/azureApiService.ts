
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
  
  try {
    // Preparar el body para tu API
    const requestBody = {
      pregunta: message,
      correo: userEmail
    };

    console.log('azureApiService: Request body:', requestBody);

    // Llamar a tu API real
    const response = await fetch('https://jarvis-api-agente-sql.azurewebsites.net/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('azureApiService: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('azureApiService: API error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const apiData = await response.json();
    console.log('azureApiService: API response data:', apiData);
    
    const processingTime = Date.now() - startTime;
    
    // Transformar la respuesta de tu API al formato esperado por el frontend
    let responseText = apiData.respuesta || apiData.text || apiData.message || 'Respuesta recibida del agente';
    
    // Si tu API devuelve datos estructurados, podemos procesarlos
    let tableData = undefined;
    let chartData = undefined;
    let downloadLink = undefined;
    let videoPreview = undefined;

    // Procesar datos si tu API los incluye
    if (apiData.data) {
      // Si tu API devuelve datos tabulares
      if (Array.isArray(apiData.data)) {
        tableData = {
          headers: Object.keys(apiData.data[0] || {}),
          rows: apiData.data.map((row: any) => Object.values(row))
        };
      }
    }

    // Procesar gráficas si tu API las incluye
    if (apiData.chart || apiData.grafica) {
      chartData = apiData.chart || apiData.grafica;
    }

    // Procesar archivos de descarga si tu API los incluye
    if (apiData.downloadUrl || apiData.download_link) {
      downloadLink = {
        url: apiData.downloadUrl || apiData.download_link,
        filename: apiData.filename || `reporte_${Date.now()}.pdf`
      };
    }

    // Procesar videos si tu API los incluye
    if (apiData.video || apiData.videoUrl) {
      videoPreview = {
        url: apiData.video || apiData.videoUrl,
        title: apiData.videoTitle || 'Video generado',
        thumbnail: apiData.thumbnail || '',
        duration: apiData.duration || '0:00',
        platform: 'generic' as const
      };
    }

    return {
      text: responseText,
      data: tableData,
      chart: chartData,
      downloadLink: downloadLink,
      videoPreview: videoPreview,
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
