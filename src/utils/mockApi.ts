
import { AISettings } from "../types/settings";

interface AgentApiResponse {
  response?: string;
  message?: string;
  error?: string;
}

// API pública de prueba
interface TestApiResponse {
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
  
  // Usar API pública de prueba temporalmente
  const testApiUrl = 'https://jsonplaceholder.typicode.com/posts/1';
  
  console.log('mockApiCall: Using test API URL:', testApiUrl);
  console.log('mockApiCall: This is a test to verify connectivity works');
  
  try {
    console.log('mockApiCall: Making fetch request to test API...');
    
    const response = await fetch(testApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('mockApiCall: Fetch completed, response status:', response.status);
    console.log('mockApiCall: Response ok:', response.ok);
    console.log('mockApiCall: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('mockApiCall: Response not ok, error text:', errorText);
      throw new Error(`Error en la API de prueba: ${response.status} - ${response.statusText}. Details: ${errorText}`);
    }

    const testData: TestApiResponse = await response.json();
    console.log('mockApiCall: Test API response data:', testData);
    
    const processingTime = Date.now() - startTime;
    
    // Crear respuesta simulada basada en la API de prueba
    const responseText = `✅ ¡Conexión exitosa con API pública!

Tu pregunta: "${message}"
Usuario: ${userEmail}

Datos de prueba obtenidos:
- ID: ${testData.id}
- Título: ${testData.title}
- Contenido: ${testData.body.substring(0, 100)}...

Esto confirma que el código de conexión funciona correctamente. El problema está en la API de Azure, no en el código.`;
    
    console.log('mockApiCall: Final response text created successfully');
    
    // Crear estructura de datos compatible con DataTable
    const tableData = {
      headers: ['Campo', 'Valor'],
      rows: [
        ['ID', testData.id.toString()],
        ['User ID', testData.userId.toString()],
        ['Título', testData.title],
        ['Contenido', testData.body.substring(0, 50) + '...']
      ]
    };
    
    return {
      text: responseText,
      data: tableData,
      processingTime
    };
    
  } catch (error) {
    console.error('mockApiCall: Error in try-catch block:', error);
    console.error('mockApiCall: Error type:', typeof error);
    console.error('mockApiCall: Error constructor:', error.constructor.name);
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('mockApiCall: This is a network connectivity issue');
      console.error('mockApiCall: Possible causes: CORS, server down, network issues');
    }
    
    // Fallback en caso de error
    const errorMessage = `❌ Error incluso con API pública de prueba: ${error instanceof Error ? error.message : 'Error desconocido'}. 

Esto indica que hay un problema en el entorno de ejecución o configuración de red.

Detalles del error:
- Tipo: ${typeof error}
- Constructor: ${error instanceof Error ? error.constructor.name : 'Desconocido'}

API de prueba utilizada: ${testApiUrl}`;

    return {
      text: errorMessage,
      processingTime: Date.now() - startTime
    };
  }
};
