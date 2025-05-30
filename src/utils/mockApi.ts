
import { TableData, ChartData, DownloadLink } from "../types/chat";
import { AISettings } from "../types/settings";

interface ApiResponse {
  text?: string;
  data?: TableData;
  chart?: ChartData;
  downloadLink?: DownloadLink;
  processingTime?: number;
}

export const mockApiCall = async (message: string, files: File[], settings?: AISettings): Promise<ApiResponse> => {
  // Simular tiempo de procesamiento basado en configuración
  const baseTime = 1000;
  const variableTime = Math.random() * 2000;
  const processingTime = baseTime + variableTime;
  
  await new Promise(resolve => setTimeout(resolve, processingTime));

  const lowerMessage = message.toLowerCase();

  // Respuestas más inteligentes basadas en configuración
  const useAdvancedModel = settings?.model?.includes('gpt-4');
  const isCreativeMode = settings?.temperature && settings.temperature > 0.7;

  // Simular diferentes tipos de respuestas basadas en el contenido del mensaje
  if (lowerMessage.includes('tabla') || lowerMessage.includes('datos') || lowerMessage.includes('ventas')) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
    const data = months.map(month => [
      month,
      Math.floor(Math.random() * 2000) + 1000,
      Math.floor(Math.random() * 500) + 200,
      `$${(Math.floor(Math.random() * 30000) + 20000).toLocaleString()}`
    ]);

    return {
      text: useAdvancedModel 
        ? "He generado una tabla detallada con análisis avanzado de los datos solicitados. Los números muestran tendencias estacionales interesantes:"
        : "He generado una tabla con los datos solicitados:",
      data: {
        headers: ["Mes", "Ventas", "Usuarios", "Ingresos"],
        rows: data
      },
      processingTime
    };
  }

  if (lowerMessage.includes('gráfica') || lowerMessage.includes('gráfico') || lowerMessage.includes('chart')) {
    const chartType = lowerMessage.includes('línea') || lowerMessage.includes('line') ? 'line' : 'bar';
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    
    return {
      text: isCreativeMode 
        ? `¡Perfecto! He creado una visualización ${chartType === 'bar' ? 'de barras' : 'de líneas'} que muestra patrones fascinantes en los datos. ¿Qué te parece si exploramos las tendencias más profundamente?`
        : `He creado una gráfica de ${chartType === 'bar' ? 'barras' : 'líneas'} para visualizar los datos:`,
      chart: {
        type: chartType,
        data: months.map(mes => ({
          mes,
          ventas: Math.floor(Math.random() * 1000) + 1000
        })),
        xKey: "mes",
        yKey: "ventas",
        title: "Análisis de Ventas Mensuales"
      },
      processingTime
    };
  }

  if (lowerMessage.includes('descargar') || lowerMessage.includes('reporte') || lowerMessage.includes('documento')) {
    const reportContent = useAdvancedModel 
      ? `Reporte Detallado - Análisis Avanzado\n\nGenerado el: ${new Date().toLocaleString()}\nModelo: ${settings?.model}\n\nEste es un reporte completo con análisis detallado de la información solicitada.\n\nIncluye:\n- Análisis estadístico\n- Tendencias identificadas\n- Recomendaciones estratégicas\n- Próximos pasos sugeridos`
      : "Reporte básico generado por el asistente AI.\n\nEste documento contiene la información solicitada.";

    return {
      text: "He preparado un reporte detallado para descargar:",
      downloadLink: {
        url: "data:text/plain;charset=utf-8," + encodeURIComponent(reportContent),
        filename: `reporte_${Date.now()}.txt`
      },
      processingTime
    };
  }

  if (files.length > 0) {
    const analysisDepth = useAdvancedModel ? "análisis avanzado con IA" : "procesamiento básico";
    return {
      text: `He realizado un ${analysisDepth} de los ${files.length} archivo(s) que subiste. Los archivos contienen información valiosa para tu consulta.`,
      data: {
        headers: ["Archivo", "Tipo", "Tamaño", "Estado", "Confianza"],
        rows: files.map(file => [
          file.name,
          file.type,
          `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          "Procesado",
          useAdvancedModel ? "Alta" : "Media"
        ])
      },
      processingTime
    };
  }

  // Respuestas por defecto más variadas
  const responses = useAdvancedModel ? [
    "Entiendo perfectamente tu consulta. Como modelo avanzado, puedo ofrecerte análisis profundos, generar visualizaciones complejas y procesar múltiples tipos de archivos con alta precisión.",
    "Excelente pregunta. Mi capacidad incluye razonamiento avanzado, análisis contextual profundo y generación de contenido sofisticado. ¿En qué aspecto específico te gustaría que profundice?",
    "Perfecto. Estoy equipado con capacidades avanzadas de procesamiento de lenguaje natural. Puedo ayudarte con análisis complejos, síntesis de información y generación de insights valiosos.",
  ] : [
    "Entiendo tu consulta. Puedo ayudarte con análisis de datos, generación de tablas, gráficas y procesamiento de archivos.",
    "¡Perfecto! Estoy aquí para asistirte. Puedes subir archivos, solicitar análisis de datos o pedirme que genere visualizaciones.",
    "Gracias por tu pregunta. Mi capacidad incluye procesamiento de documentos, creación de tablas y gráficas, y análisis de datos.",
  ];

  const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return {
    text: isCreativeMode 
      ? selectedResponse + " ¡Estoy emocionado de explorar esto contigo! 🚀"
      : selectedResponse,
    processingTime
  };
};
