import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('=== DEBUG REQUEST ===');
    console.log('Method:', request.method);
    console.log('URL:', request.url);
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    
    // Try different parsing methods
    let body: any = {};
    let parsingMethod = '';
    
    try {
      // Method 1: request.json()
      body = await request.json();
      parsingMethod = 'request.json()';
      console.log('&#9989; Success with request.json():', body);
    } catch (jsonError) {
      console.log('&#10060; request.json() failed:', jsonError);
      
      try {
        // Method 2: request.text() + JSON.parse()
        const rawText = await request.text();
        console.log('Raw text length:', rawText.length);
        console.log('Raw text content:', rawText);
        
        if (rawText && rawText.trim()) {
          body = JSON.parse(rawText);
          parsingMethod = 'request.text() + JSON.parse()';
          console.log('&#9989; Success with request.text() + JSON.parse():', body);
        } else {
          console.log('&#10060; Empty or whitespace-only body');
          
          // Method 3: Try formData
          try {
            const formData = await request.formData();
            console.log('FormData entries:', Array.from(formData.entries()));
            if (formData.has('data')) {
              const dataString = formData.get('data') as string;
              body = JSON.parse(dataString);
              parsingMethod = 'formData';
              console.log('&#9989; Success with formData:', body);
            }
          } catch (formError) {
            console.log('&#10060; formData failed:', formError);
          }
          
          // Method 4: Try arrayBuffer
          try {
            const arrayBuffer = await request.arrayBuffer();
            console.log('ArrayBuffer length:', arrayBuffer.byteLength);
            if (arrayBuffer.byteLength > 0) {
              const text = new TextDecoder().decode(arrayBuffer);
              console.log('ArrayBuffer text:', text);
              body = JSON.parse(text);
              parsingMethod = 'arrayBuffer';
              console.log('&#9989; Success with arrayBuffer:', body);
            }
          } catch (arrayError) {
            console.log('&#10060; arrayBuffer failed:', arrayError);
          }
        }
      } catch (textError) {
        console.log('&#10060; request.text() + JSON.parse() failed:', textError);
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
      parsingMethod: parsingMethod,
      bodyType: typeof body,
      bodyKeys: body && typeof body === 'object' ? Object.keys(body) : [],
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Debug request error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
