// Authentication Proxy Script
// This script handles seamless authentication flow redirection
// from custom domain to production URL while maintaining custom domain visibility

(function() {
  console.log('🔧 [AUTH-PROXY] Authentication proxy script loaded');
  
  // Configuration
  const PRODUCTION_URL = 'https://tetrix-minimal-uzzxn.ondigitalocean.app';
  const CUSTOM_DOMAIN = window.location.origin;
  
  // Override fetch for authentication API calls
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    // Check if this is an authentication API call
    if (typeof url === 'string' && (
      url.includes('/api/v2/2fa/') || 
      url.includes('/api/v2/industry-auth/') ||
      url.includes('/dashboards/')
    )) {
      // Convert relative URLs to production URLs
      if (url.startsWith('/')) {
        url = PRODUCTION_URL + url;
      } else if (url.startsWith(CUSTOM_DOMAIN)) {
        url = url.replace(CUSTOM_DOMAIN, PRODUCTION_URL);
      }
      
      console.log(`🔄 [AUTH-PROXY] Proxying API call to: ${url}`);
    }
    
    return originalFetch.call(this, url, options);
  };
  
  // Override XMLHttpRequest for authentication API calls
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    // Check if this is an authentication API call
    if (typeof url === 'string' && (
      url.includes('/api/v2/2fa/') || 
      url.includes('/api/v2/industry-auth/') ||
      url.includes('/dashboards/')
    )) {
      // Convert relative URLs to production URLs
      if (url.startsWith('/')) {
        url = PRODUCTION_URL + url;
      } else if (url.startsWith(CUSTOM_DOMAIN)) {
        url = url.replace(CUSTOM_DOMAIN, PRODUCTION_URL);
      }
      
      console.log(`🔄 [AUTH-PROXY] Proxying XHR call to: ${url}`);
    }
    
    return originalXHROpen.call(this, method, url, ...args);
  };
  
  // Handle dashboard redirects
  function handleDashboardRedirect(url) {
    if (url.includes('/dashboards/')) {
      // Extract the dashboard path and parameters
      const urlObj = new URL(url);
      const dashboardPath = urlObj.pathname;
      const searchParams = urlObj.search;
      
      // Construct the production URL
      const productionUrl = `${PRODUCTION_URL}${dashboardPath}${searchParams}`;
      
      console.log(`🔄 [AUTH-PROXY] Redirecting to production dashboard: ${productionUrl}`);
      
      // Redirect to production URL
      window.location.href = productionUrl;
      return true;
    }
    return false;
  }
  
  // Override window.open for dashboard redirects
  const originalWindowOpen = window.open;
  window.open = function(url, ...args) {
    if (typeof url === 'string' && handleDashboardRedirect(url)) {
      return null; // Prevent opening in new window
    }
    return originalWindowOpen.call(this, url, ...args);
  };
  
  // Override window.location.href for dashboard redirects
  let originalLocationHref = Object.getOwnPropertyDescriptor(window.location, 'href') || 
                            Object.getOwnPropertyDescriptor(Location.prototype, 'href');
  
  if (originalLocationHref) {
    Object.defineProperty(window.location, 'href', {
      get: originalLocationHref.get,
      set: function(url) {
        if (typeof url === 'string' && handleDashboardRedirect(url)) {
          return; // Prevent setting location
        }
        originalLocationHref.set.call(this, url);
      }
    });
  }
  
  // Handle form submissions that might redirect to dashboards
  document.addEventListener('submit', function(event) {
    const form = event.target;
    if (form && form.action && form.action.includes('/dashboards/')) {
      event.preventDefault();
      
      const formData = new FormData(form);
      const url = new URL(form.action, window.location.origin);
      
      // Convert to production URL
      const productionUrl = `${PRODUCTION_URL}${url.pathname}${url.search}`;
      
      console.log(`🔄 [AUTH-PROXY] Proxying form submission to: ${productionUrl}`);
      
      // Submit to production URL
      fetch(productionUrl, {
        method: form.method || 'POST',
        body: formData
      }).then(response => {
        if (response.ok) {
          // Handle successful authentication
          const redirectUrl = response.url;
          if (redirectUrl.includes('/dashboards/')) {
            handleDashboardRedirect(redirectUrl);
          }
        }
      }).catch(error => {
        console.error('❌ [AUTH-PROXY] Form submission error:', error);
      });
    }
  });
  
  console.log('✅ [AUTH-PROXY] Authentication proxy initialized successfully');
})();
