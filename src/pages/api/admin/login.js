export async function POST({ request }) {
  try {
    const { password } = await request.json();
    
    // Get admin password from environment variable
    const adminPassword = import.meta.env.ADMIN_PASSWORD || 'tetrix2024';
    
    // Simple password check (in production, use proper authentication)
    if (password === adminPassword) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Login successful'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid password'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Login API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 