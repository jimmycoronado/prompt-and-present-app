
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pregunta, correo } = await req.json()
    
    console.log('Azure Agent Proxy: Received request:', { pregunta, correo })
    
    // Make request to Azure API
    const azureResponse = await fetch('https://skcoaimultiagentdev.azurewebsites.net/base-madre', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pregunta,
        correo,
        EntraToken
      })
    })

    console.log('Azure Agent Proxy: Azure API response status:', azureResponse.status)

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text()
      console.error('Azure Agent Proxy: Azure API error:', errorText)
      throw new Error(`Azure API error: ${azureResponse.status} - ${errorText}`)
    }

    const data = await azureResponse.json()
    console.log('Azure Agent Proxy: Azure API response data:', data)

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Azure Agent Proxy: Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Error in Azure Agent Proxy function'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
