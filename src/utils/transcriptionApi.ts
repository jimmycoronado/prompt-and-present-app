
// Simulación de API de transcripción
// En producción, esto debería conectarse a un servicio real como OpenAI Whisper o Google Speech-to-Text

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  // Simular tiempo de procesamiento
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simulación de transcripción
  const sampleTranscriptions = [
    "Hola, ¿cómo estás?",
    "¿Podrías ayudarme con esta consulta?",
    "Necesito información sobre los productos de Skandia",
    "¿Cuáles son las opciones de inversión disponibles?",
    "Me gustaría conocer más sobre los seguros de vida",
    "¿Cómo puedo contactar con un asesor?",
    "Quisiera saber sobre los fondos de pensiones",
    "¿Hay alguna promoción vigente?",
  ];
  
  return sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
};
