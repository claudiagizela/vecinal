
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestData {
  imageBase64: string;
}

interface ResponseData {
  success: boolean;
  text: string;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json() as RequestData;

    if (!imageBase64 || !imageBase64.includes('base64,')) {
      throw new Error('Invalid image data');
    }

    // Get base64 image data without the prefix
    const base64Data = imageBase64.split('base64,')[1];
    
    // Call Google Cloud Vision API
    const apiKey = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY');
    if (!apiKey) {
      throw new Error('Google Cloud Vision API key not configured');
    }

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Data,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log('Vision API response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`Vision API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Extract the full text from the response
    const fullTextAnnotation = data.responses[0]?.fullTextAnnotation?.text || '';
    
    return new Response(
      JSON.stringify({
        success: true,
        text: fullTextAnnotation,
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
      }
    );
  } catch (error) {
    console.error('Error processing image:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        text: '',
        error: error.message,
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500,
      }
    );
  }
});
