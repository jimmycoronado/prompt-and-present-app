
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
    
    // Procesar la respuesta completa para extraer todos los tipos de contenido
    let responseText = '';
    let tableData = undefined;
    let chartData = undefined;
    let downloadLink = undefined;
    let videoPreview = undefined;

    // CASO 1: Respuesta es un array directo (datos tabulares puros)
    if (Array.isArray(apiData)) {
      console.log('azureApiService: Processing direct array response with', apiData.length, 'items');
      
      responseText = `Se encontraron ${apiData.length} registros:`;
      
      if (apiData.length > 0) {
        const headers = Object.keys(apiData[0]);
        const rows = apiData.map((item: any) => Object.values(item));
        
        tableData = {
          headers,
          rows
        };
        
        console.log('azureApiService: Created table data with headers:', headers);
      }
    }
    
    // CASO 2: Respuesta es un objeto complejo (puede contener múltiples tipos)
    else if (typeof apiData === 'object' && apiData !== null) {
      console.log('azureApiService: Processing complex object response');
      
      // EXTRAER TEXTO DE RESPUESTA
      responseText = apiData.respuesta || 
                   apiData.text || 
                   apiData.message || 
                   apiData.resultado ||
                   apiData.descripcion ||
                   '';

      // EXTRAER DATOS TABULARES
      // Puede estar en diferentes ubicaciones
      let dataArray = null;
      if (Array.isArray(apiData.data)) {
        dataArray = apiData.data;
      } else if (Array.isArray(apiData.tabla)) {
        dataArray = apiData.tabla;
      } else if (Array.isArray(apiData.registros)) {
        dataArray = apiData.registros;
      } else if (Array.isArray(apiData.resultados)) {
        dataArray = apiData.resultados;
      }

      if (dataArray && dataArray.length > 0) {
        const headers = Object.keys(dataArray[0]);
        const rows = dataArray.map((row: any) => Object.values(row));
        
        tableData = {
          headers,
          rows
        };
        
        // Agregar información de tabla al texto si no existe
        if (!responseText) {
          responseText = `Se encontraron ${dataArray.length} registros:`;
        }
        
        console.log('azureApiService: Extracted table data with', dataArray.length, 'rows');
      }

      // EXTRAER GRÁFICAS
      if (apiData.chart || apiData.grafica || apiData.graph) {
        chartData = apiData.chart || apiData.grafica || apiData.graph;
        console.log('azureApiService: Extracted chart data:', chartData);
      }

      // EXTRAER ENLACES DE DESCARGA
      if (apiData.downloadUrl || apiData.download_link || apiData.archivo || apiData.file) {
        const url = apiData.downloadUrl || apiData.download_link || apiData.archivo || apiData.file;
        const filename = apiData.filename || apiData.nombre_archivo || `reporte_${Date.now()}.pdf`;
        
        downloadLink = {
          url: url,
          filename: filename
        };
        
        console.log('azureApiService: Extracted download link:', downloadLink);
      }

      // EXTRAER VIDEOS
      if (apiData.video || apiData.videoUrl || apiData.video_url) {
        const videoUrl = apiData.video || apiData.videoUrl || apiData.video_url;
        
        videoPreview = {
          url: videoUrl,
          title: apiData.videoTitle || apiData.titulo_video || 'Video generado por el agente',
          thumbnail: apiData.thumbnail || apiData.miniatura || `${videoUrl}?thumbnail=true`,
          duration: apiData.duration || apiData.duracion || '0:00',
          platform: apiData.platform || 'generic' as const
        };
        
        console.log('azureApiService: Extracted video preview:', videoPreview);
      }

      // Si no hay texto pero hay otros elementos, crear un mensaje descriptivo
      if (!responseText && (tableData || chartData || downloadLink || videoPreview)) {
        const elements = [];
        if (tableData) elements.push('tabla de datos');
        if (chartData) elements.push('gráfica');
        if (downloadLink) elements.push('archivo para descargar');
        if (videoPreview) elements.push('video');
        
        responseText = `He generado: ${elements.join(', ')}.`;
      }
    }
    
    // CASO 3: Respuesta es texto simple
    else {
      responseText = String(apiData) || 'Respuesta recibida del agente';
    }

    // Asegurar que siempre hay algún texto de respuesta
    if (!responseText) {
      responseText = 'Respuesta procesada correctamente.';
    }

    console.log('azureApiService: Final processed response:', {
      hasText: !!responseText,
      hasTable: !!tableData,
      hasChart: !!chartData,
      hasDownload: !!downloadLink,
      hasVideo: !!videoPreview
    });

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
