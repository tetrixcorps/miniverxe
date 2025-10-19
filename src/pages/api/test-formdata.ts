import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('=== TEST FORMDATA ===');
    console.log('Method:', request.method);
    console.log('URL:', request.url);
    console.log('Content-Type:', request.headers.get('content-type'));
    
    let result: any = {};
    
    try {
      // Try formData
      const formData = await request.formData();
      console.log('FormData entries:', Array.from(formData.entries()));
      
      result.formData = Object.fromEntries(formData.entries());
      result.formDataSuccess = true;
    } catch (formError) {
      console.log('FormData failed:', formError);
      result.formDataError = formError instanceof Error ? formError.message : 'Unknown error';
    }
    
    try {
      // Try arrayBuffer
      const arrayBuffer = await request.arrayBuffer();
      console.log('ArrayBuffer length:', arrayBuffer.byteLength);
      
      if (arrayBuffer.byteLength > 0) {
        const text = new TextDecoder().decode(arrayBuffer);
        console.log('ArrayBuffer text:', text);
        result.arrayBuffer = text;
        result.arrayBufferSuccess = true;
      } else {
        result.arrayBuffer = 'empty';
        result.arrayBufferSuccess = false;
      }
    } catch (arrayError) {
      console.log('ArrayBuffer failed:', arrayError);
      result.arrayBufferError = arrayError instanceof Error ? arrayError.message : 'Unknown error';
    }
    
    try {
      // Try text
      const text = await request.text();
      console.log('Text length:', text.length);
      console.log('Text content:', text);
      
      result.text = text;
      result.textSuccess = text.length > 0;
    } catch (textError) {
      console.log('Text failed:', textError);
      result.textError = textError instanceof Error ? textError.message : 'Unknown error';
    }
    
    try {
      // Try json
      const json = await request.json();
      console.log('JSON:', json);
      
      result.json = json;
      result.jsonSuccess = true;
    } catch (jsonError) {
      console.log('JSON failed:', jsonError);
      result.jsonError = jsonError instanceof Error ? jsonError.message : 'Unknown error';
    }
    
    return new Response(JSON.stringify({
      success: true,
      method: request.method,
      url: request.url,
      contentType: request.headers.get('content-type'),
      result: result,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Test formdata error:', error);
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
