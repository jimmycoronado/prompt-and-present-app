
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
    
    console.log('Calling Supabase Edge Function...');
    
    // Call the Supabase Edge Function instead of Azure directly
    const response = await fetch('https://oqrwucgwqttdcsymksoi.supabase.co/functions/v1/transcribe-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audio: base64Audio })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase transcription function error:', errorText);
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
