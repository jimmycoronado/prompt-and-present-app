
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
    const { pregunta, correo, EntraToken } = await req.json()
    
    console.log('Azure Agent Proxy: Received request:', { pregunta, correo, EntraToken: EntraToken ? EntraToken.substring(0, 20) + '...' : 'empty' })
    
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

    // Try to parse as JSON first
    const responseText = await azureResponse.text()
    console.log('Azure Agent Proxy: Raw response text:', responseText)
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.log('Azure Agent Proxy: Response is not JSON, treating as text:', parseError)
      data = { text: responseText }
    }
    
    console.log('Azure Agent Proxy: Parsed response data:', data)

    // Check if this is the "no data" response case
    if (data && typeof data === 'object' && data.detail && 
        (data.detail.includes('La consulta fue exitosa pero no hay datos') || 
         data.detail.includes('200:') && data.detail.includes('no hay datos'))) {
      console.log('Azure Agent Proxy: Detected "no data" response, treating as success')
      return new Response(
        JSON.stringify(data),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // For other responses, check if the original request failed
    if (!azureResponse.ok && azureResponse.status !== 500) {
      console.error('Azure Agent Proxy: Azure API error:', responseText)
      throw new Error(`Azure API error: ${azureResponse.status} - ${responseText}`)
    }

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
