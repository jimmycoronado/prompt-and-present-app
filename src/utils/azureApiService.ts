
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
  userEmail: string,
  accessToken?: string | null
): Promise<AzureApiResponse> => {
  console.log('azureApiService: Starting call to Azure API with message:', message);
  console.log('azureApiService: User email:', userEmail);
  console.log('azureApiService: Access token present:', !!accessToken);
  console.log('azureApiService: Files count:', files.length);
  
  const startTime = Date.now();
  
  // Preparar el body para tu API
  const requestBody = {
    pregunta: message,
    correo: userEmail,
    EntraToken: accessToken || ''
  };

  console.log('azureApiService: Request body:', {
    ...requestBody,
    EntraToken: accessToken ? accessToken.substring(0, 20) + '...' : 'empty'
  });

  try {
    // Intentar conexión directa primero
    console.log('azureApiService: Attempting direct connection to Azure API...');
    const response = await fetch('https://skcoaimultiagentdev.azurewebsites.net/base-madre', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('azureApiService: Direct API response status:', response.status);

    const responseText = await response.text();
    console.log('azureApiService: Direct API raw response:', responseText);
    
    let apiData;
    try {
      apiData = JSON.parse(responseText);
    } catch (parseError) {
      console.log('azureApiService: Response is not JSON, treating as text');
      apiData = { text: responseText };
    }
    
    console.log('azureApiService: Direct API parsed data:', apiData);

    // Check if this is a "no data" response - treat as success
    if (apiData && typeof apiData === 'object' && apiData.detail && 
        (apiData.detail.includes('La consulta fue exitosa pero no hay datos') || 
         (apiData.detail.includes('200:') && apiData.detail.includes('no hay datos')))) {
      console.log('azureApiService: Detected "no data" response from direct API, treating as success');
      return processApiResponse(apiData, startTime);
    }

    // Only throw error if it's not the "no data" case and the response is not ok
    if (!response.ok) {
      console.error('azureApiService: Direct API error:', responseText);
      throw new Error(`API Error: ${response.status} - ${responseText}`);
    }
    
    return processApiResponse(apiData, startTime);
    
  } catch (directError) {
    console.error('azureApiService: Direct API failed, trying proxy:', directError);
    
    try {
      // Usar el proxy de Supabase como fallback con URL directa del proyecto
      console.log('azureApiService: Attempting connection via Supabase proxy...');
      const proxyUrl = 'https://nliwgjfaqthjdpfmmmgo.supabase.co/functions/v1/azure-agent-proxy';
      console.log('azureApiService: Proxy URL:', proxyUrl);
      
      const proxyResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5saXdnamZhcXRoamRwZm1tbWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MzkxNTMsImV4cCI6MjA2NDIxNTE1M30.JBUdQRPt570J8RAgwSu7tGiGswy9ra5-v0YwQRZyzYo',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('azureApiService: Proxy response status:', proxyResponse.status);

      const proxyResponseText = await proxyResponse.text();
      console.log('azureApiService: Proxy raw response:', proxyResponseText);

      let apiData;
      try {
        apiData = JSON.parse(proxyResponseText);
      } catch (parseError) {
        console.log('azureApiService: Proxy response is not JSON, treating as text');
        apiData = { text: proxyResponseText };
      }

      console.log('azureApiService: Proxy response data:', apiData);

      // Check if this is a "no data" response even if it came through error handling
      if (apiData && typeof apiData === 'object') {
        // Check if the error message contains the "no data" response
        if ((apiData.error && apiData.error.includes('La consulta fue exitosa pero no hay datos')) ||
            (apiData.detail && apiData.detail.includes('La consulta fue exitosa pero no hay datos'))) {
          console.log('azureApiService: Detected "no data" response from proxy error, treating as success');
          // Extract the actual detail message
          const detailMatch = apiData.error ? apiData.error.match(/\{"detail":"([^"]+)"\}/) : null;
          if (detailMatch) {
            return processApiResponse({ detail: detailMatch[1] }, startTime);
          }
          return processApiResponse({ detail: 'La consulta fue exitosa pero no hay datos.' }, startTime);
        }
      }

      if (!proxyResponse.ok) {
        console.error('azureApiService: Proxy error:', proxyResponseText);
        throw new Error(`Proxy Error: ${proxyResponse.status} - ${proxyResponseText}`);
      }
      
      return processApiResponse(apiData, startTime);
      
    } catch (proxyError) {
      console.error('azureApiService: Both direct and proxy failed:', proxyError);
      
      const errorMessage = `❌ Error al conectar con el agente: ${proxyError instanceof Error ? proxyError.message : 'Error desconocido'}. Por favor, inténtalo de nuevo.`;

      return {
        text: errorMessage,
        processingTime: Date.now() - startTime
      };
    }
  }
};

function processApiResponse(apiData: any, startTime: number): AzureApiResponse {
  const processingTime = Date.now() - startTime;
  
  // Manejar respuesta con campo "detail" cuando no hay datos
  if (apiData && typeof apiData === 'object' && apiData.detail) {
    console.log('azureApiService: Processing response with detail field:', apiData.detail);
    
    // Verificar si es una respuesta exitosa sin datos
    if (apiData.detail.includes('200') && apiData.detail.includes('no hay datos')) {
      return {
        text: 'No se encontraron datos que coincidan con la consulta realizada.',
        processingTime
      };
    }
    
    // Para otros casos con detail, usar el contenido del detail
    return {
      text: apiData.detail,
      processingTime
    };
  }
  
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
}
