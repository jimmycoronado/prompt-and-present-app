
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
    // Detectar si el usuario está pidiendo gráficas
    const messageLower = message.toLowerCase();
    const isChartRequest = messageLower.includes('gráfica') || 
                          messageLower.includes('grafica') ||
                          messageLower.includes('chart') ||
                          messageLower.includes('barras') ||
                          messageLower.includes('líneas') ||
                          messageLower.includes('lineas') ||
                          messageLower.includes('pie') ||
                          messageLower.includes('ventas') ||
                          messageLower.includes('estadísticas') ||
                          messageLower.includes('estadisticas');

    if (isChartRequest) {
      console.log('mockApiCall: Chart request detected');
      
      // Determinar tipo de gráfica basado en palabras clave
      let chartType: 'bar' | 'line' | 'pie' = 'bar';
      if (messageLower.includes('línea') || messageLower.includes('linea') || messageLower.includes('line')) {
        chartType = 'line';
      } else if (messageLower.includes('pie') || messageLower.includes('pastel') || messageLower.includes('torta')) {
        chartType = 'pie';
      }

      // Generar datos según el tipo de gráfica
      let chartData;
      
      if (chartType === 'pie') {
        chartData = {
          type: chartType,
          data: [
            { categoria: 'Ventas Online', valor: 3500, fill: '#0088FE' },
            { categoria: 'Ventas en Tienda', valor: 2800, fill: '#00C49F' },
            { categoria: 'Ventas Telefónicas', valor: 1200, fill: '#FFBB28' },
            { categoria: 'Ventas por Catálogo', valor: 800, fill: '#FF8042' },
            { categoria: 'Ventas Mayoristas', valor: 1500, fill: '#8884D8' }
          ],
          nameKey: 'categoria',
          valueKey: 'valor',
          title: 'Distribución de Ventas por Canal - Gráfica de Pie'
        };
      } else {
        chartData = {
          type: chartType,
          data: [
            { mes: 'Enero', ventas: 4500, gastos: 2800 },
            { mes: 'Febrero', ventas: 5200, gastos: 3100 },
            { mes: 'Marzo', ventas: 4800, gastos: 2900 },
            { mes: 'Abril', ventas: 6100, gastos: 3400 },
            { mes: 'Mayo', ventas: 5800, gastos: 3200 },
            { mes: 'Junio', ventas: 6800, gastos: 3700 }
          ],
          xKey: 'mes',
          yKey: 'ventas',
          title: chartType === 'bar' ? 'Ventas Mensuales - Gráfica de Barras' : 'Tendencia de Ventas - Gráfica de Líneas'
        };
      }

      const processingTime = Date.now() - startTime;
      
      let responseText;
      if (chartType === 'pie') {
        responseText = `He generado una gráfica de pie basada en tu solicitud: "${message}"\n\n`;
        responseText += `La gráfica muestra la distribución de ventas por diferentes canales. Puedes ver qué porcentaje representa cada canal del total de ventas.`;
      } else {
        responseText = `He generado una ${chartType === 'bar' ? 'gráfica de barras' : 'gráfica de líneas'} basada en tu solicitud: "${message}"\n\n`;
        responseText += `La gráfica muestra datos de ventas mensuales de los últimos 6 meses. Puedes ver la tendencia y comparar los valores mes a mes.`;
      }

      return {
        text: responseText,
        chart: chartData,
        processingTime
      };
    }

    // Si no es una solicitud de gráfica, continuar con la lógica original
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
    
    // Generar enlace de descarga usando Lorem Picsum
    const imageId = Math.floor(Math.random() * 1000) + 1;
    const downloadLink = {
      url: `https://picsum.photos/800/600?random=${imageId}`,
      filename: `reporte_consulta_${Date.now()}.jpg`
    };
    
    console.log('mockApiCall: Generated download link:', downloadLink);
    
    return {
      text: responseText + `\n\n📎 He generado un reporte visual basado en tu consulta que puedes descargar.`,
      data: tableData,
      downloadLink,
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
