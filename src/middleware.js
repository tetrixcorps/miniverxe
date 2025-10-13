// src/middleware.js
export function onRequest(context, next) {
  // Get the hostname from the incoming request headers
  const hostname = context.request.headers.get('host') || '';

  // Get your primary domains from environment variables
  const tetrixDomain = process.env.TETRIX_DOMAIN;
  const joromiDomain = process.env.JOROMI_DOMAIN;

  let brand;
  let theme;

  // Determine the brand based on the hostname
  if (hostname.includes(tetrixDomain)) {
    brand = 'tetrix';
    theme = 'theme-blue';
  } else if (hostname.includes(joromiDomain)) {
    brand = 'joromi';
    theme = 'theme-green';
  } else {
    brand = 'default';
    theme = 'theme-default';
  }

  // Pass the branding info to all your pages and API routes
  context.locals.brand = brand;
  context.locals.theme = theme;

  // Continue to the next middleware or the page
  return next();
}
