
import { TableData, ChartData, DownloadLink } from "../types/chat";

interface ApiResponse {
  text?: string;
  data?: TableData;
  chart?: ChartData;
  downloadLink?: DownloadLink;
  processingTime?: number;
}

export const mockApiCall = async (message: string, files: File[]): Promise<ApiResponse> => {
  // Simular tiempo de procesamiento
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const lowerMessage = message.toLowerCase();

  // Simular diferentes tipos de respuestas basadas en el contenido del mensaje
  if (lowerMessage.includes('tabla') || lowerMessage.includes('datos') || lowerMessage.includes('ventas')) {
    return {
      text: "He generado una tabla con los datos solicitados:",
      data: {
        headers: ["Mes", "Ventas", "Usuarios", "Ingresos"],
        rows: [
          ["Enero", 1250, 340, "$25,400"],
          ["Febrero", 1890, 520, "$37,800"],
          ["Marzo", 2100, 680, "$42,000"],
          ["Abril", 1750, 490, "$35,000"],
          ["Mayo", 2350, 780, "$47,000"]
        ]
      },
      processingTime: 1500
    };
  }

  if (lowerMessage.includes('gráfica') || lowerMessage.includes('gráfico') || lowerMessage.includes('chart')) {
    const chartType = lowerMessage.includes('línea') || lowerMessage.includes('line') ? 'line' : 'bar';
    
    return {
      text: `He creado una gráfica de ${chartType === 'bar' ? 'barras' : 'líneas'} para visualizar los datos:`,
      chart: {
        type: chartType,
        data: [
          { mes: "Ene", ventas: 1250 },
          { mes: "Feb", ventas: 1890 },
          { mes: "Mar", ventas: 2100 },
          { mes: "Abr", ventas: 1750 },
          { mes: "May", ventas: 2350 }
        ],
        xKey: "mes",
        yKey: "ventas",
        title: "Ventas Mensuales"
      },
      processingTime: 2200
    };
  }

  if (lowerMessage.includes('descargar') || lowerMessage.includes('reporte') || lowerMessage.includes('documento')) {
    return {
      text: "He preparado un documento para descargar con la información solicitada:",
      downloadLink: {
        url: "data:text/plain;charset=utf-8," + encodeURIComponent("Este es un documento de ejemplo generado por el asistente AI."),
        filename: "reporte_ejemplo.txt"
      },
      processingTime: 1800
    };
  }

  if (files.length > 0) {
    const fileTypes = files.map(f => f.type).join(', ');
    return {
      text: `He analizado los ${files.length} archivo(s) que subiste (${fileTypes}). Los archivos se han procesado correctamente y contienen información relevante para tu consulta.`,
      data: {
        headers: ["Archivo", "Tipo", "Tamaño", "Estado"],
        rows: files.map(file => [
          file.name,
          file.type,
          `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          "Procesado"
        ])
      },
      processingTime: 2500
    };
  }

  // Respuesta por defecto
  const responses = [
    "Entiendo tu consulta. Puedo ayudarte con análisis de datos, generación de tablas, gráficas y procesamiento de archivos.",
    "¡Perfecto! Estoy aquí para asistirte. Puedes subir archivos, solicitar análisis de datos o pedirme que genere visualizaciones.",
    "Gracias por tu pregunta. Mi capacidad incluye procesamiento de documentos, creación de tablas y gráficas, y análisis de datos.",
    "Me alegra poder ayudarte. Puedo trabajar con PDFs, imágenes, archivos Excel y generar reportes personalizados.",
  ];

  return {
    text: responses[Math.floor(Math.random() * responses.length)],
    processingTime: 800
  };
};
