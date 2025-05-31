
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    console.log('Converting audio blob to base64...');
    
    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Audio = btoa(binaryString);
    
    console.log('Calling Azure transcription API...');
    
    // Call your Azure API for transcription
    const response = await fetch('https://jarvis-api-agente-sql.azurewebsites.net/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audio: base64Audio })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure transcription API error:', errorText);
      throw new Error(`Error de transcripción: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data?.text) {
      throw new Error('No se recibió texto transcrito');
    }
    
    console.log('Transcription completed:', data.text);
    return data.text;
    
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    throw new Error('Error al transcribir el audio. Por favor, inténtalo de nuevo.');
  }
};
