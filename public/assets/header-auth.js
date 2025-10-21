// Header auth and menu behavior wired unobtrusively (CSP-friendly)
(function () {
  console.log('🔧 header-auth.js loaded and executing...');
  
  function onReady(fn) {
    console.log('🔧 onReady called, document readyState:', document.readyState);
    if (document.readyState === 'loading') {
      console.log('🔧 Document still loading, adding DOMContentLoaded listener');
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      console.log('🔧 Document already ready, executing immediately');
      fn();
    }
  }

  onReady(function () {
    console.log('🔧 header-auth.js onReady callback executing...');
    var btn = document.getElementById('mobile-menu-btn');
    var menu = document.getElementById('mobile-menu');
    var openProductsModal = document.getElementById('open-products-modal');
    var openProductsModalMobile = document.getElementById('open-products-modal-mobile');
    var productsModal = document.getElementById('products-modal');
    
    console.log('🔧 Found elements:', {
      mobileMenuBtn: !!btn,
      mobileMenu: !!menu,
      openProductsModal: !!openProductsModal,
      openProductsModalMobile: !!openProductsModalMobile,
      productsModal: !!productsModal
    });

    // Mobile menu toggle
    if (btn && menu) {
      btn.addEventListener('click', function () {
        var open = menu.classList.toggle('hidden');
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        if (!open) {
          menu.focus();
        }
      });

      // Close menu on link click
      Array.prototype.forEach.call(menu.querySelectorAll('a'), function (link) {
        link.addEventListener('click', function () {
          menu.classList.add('hidden');
          btn.setAttribute('aria-expanded', 'false');
        });
      });

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!(e.target instanceof Node)) return;
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
          menu.classList.add('hidden');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    function closeMenuIfOpen() {
      if (menu && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    }

    // Products modal open
    function openProducts(e) {
      if (e) e.preventDefault();
      if (productsModal) {
        productsModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        closeMenuIfOpen();
      }
    }
    if (openProductsModal) openProductsModal.addEventListener('click', openProducts);
    if (openProductsModalMobile) openProductsModalMobile.addEventListener('click', openProducts);

    // Helpers for auth flows
    function setContext(ctx) {
      try {
        window.tetrixAuthContext = ctx;
      } catch (_) {}
    }

    function open2FA() {
      if (typeof window.open2FAModal === 'function') {
        window.open2FAModal();
        closeMenuIfOpen();
      } else {
        // No-op if not loaded yet
        // console.error('2FA modal not available');
      }
    }

    function openIndustryAuth() {
      console.log('🔧 openIndustryAuth called');
      console.log('🔧 [VERBOSE] Current window state:', {
        userAgent: navigator.userAgent,
        url: window.location.href,
        readyState: document.readyState,
        timestamp: new Date().toISOString()
      });
      
      // Enhanced retry logic with comprehensive error logging
      function tryOpenIndustryAuth(attempts = 0, maxAttempts = 15) {
        console.log(`🔧 [VERBOSE] Attempting to open Industry Auth modal (attempt ${attempts + 1}/${maxAttempts})`);
        console.log(`🔧 [VERBOSE] Current attempt details:`, {
          attempt: attempts + 1,
          maxAttempts,
          timestamp: new Date().toISOString(),
          windowFunctions: Object.keys(window).filter(k => k.includes('Industry') || k.includes('Auth') || k.includes('open')),
          documentReadyState: document.readyState,
          scriptsLoaded: document.querySelectorAll('script').length
        });
        
        if (typeof window.openIndustryAuthModal === 'function') {
          console.log('✅ [VERBOSE] Industry Auth modal function found, opening...');
          console.log('✅ [VERBOSE] Function details:', {
            functionType: typeof window.openIndustryAuthModal,
            functionName: 'openIndustryAuthModal',
            functionExists: true,
            timestamp: new Date().toISOString()
          });
          
          try {
            window.openIndustryAuthModal();
            closeMenuIfOpen();
            console.log('✅ [VERBOSE] Industry Auth modal opened successfully');
            console.log('✅ [VERBOSE] Modal state after opening:', {
              modalElement: document.getElementById('industry-auth-modal'),
              modalVisible: document.getElementById('industry-auth-modal')?.classList.contains('hidden') === false,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('❌ [VERBOSE] Error opening Industry Auth modal:', {
              error: error,
              message: error.message,
              stack: error.stack,
              name: error.name,
              timestamp: new Date().toISOString(),
              windowState: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                readyState: document.readyState
              }
            });
            alert('Authentication service encountered an error. Please try again later.');
          }
        } else if (attempts < maxAttempts) {
          console.log(`⏳ [VERBOSE] Industry Auth modal not available, waiting... (attempt ${attempts + 1}/${maxAttempts})`);
          console.log(`⏳ [VERBOSE] Current window state:`, {
            openIndustryAuthModal: typeof window.openIndustryAuthModal,
            allWindowFunctions: Object.keys(window).filter(k => k.includes('open') || k.includes('Industry') || k.includes('Auth')),
            scripts: Array.from(document.querySelectorAll('script')).map(s => s.src || s.textContent?.substring(0, 100)),
            timestamp: new Date().toISOString()
          });
          
          setTimeout(() => {
            tryOpenIndustryAuth(attempts + 1, maxAttempts);
          }, 200);
        } else {
          console.error('❌ [VERBOSE] Industry Auth modal still not available after waiting');
          console.error('❌ [VERBOSE] Final failure state:', {
            attempts: attempts,
            maxAttempts,
            openIndustryAuthModal: typeof window.openIndustryAuthModal,
            availableFunctions: Object.keys(window).filter(k => k.includes('Industry') || k.includes('Auth')),
            allWindowKeys: Object.keys(window).slice(0, 20), // First 20 keys
            scripts: Array.from(document.querySelectorAll('script')).map(s => ({
              src: s.src,
              type: s.type,
              async: s.async,
              defer: s.defer
            })),
            timestamp: new Date().toISOString()
          });
          alert('Authentication service is temporarily unavailable. Please try again later.');
        }
      }
      
      tryOpenIndustryAuth();
    }

    // Code Academy buttons
    var codeAcademyBtn = document.getElementById('open-code-academy-modal');
    var codeAcademyBtnMobile = document.getElementById('open-code-academy-modal-mobile');
    if (codeAcademyBtn)
      codeAcademyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        setContext('code-academy');
        open2FA();
      });
    if (codeAcademyBtnMobile)
      codeAcademyBtnMobile.addEventListener('click', function (e) {
        e.preventDefault();
        setContext('code-academy');
        open2FA();
      });

    // JoRoMi buttons
    var joromiBtn = document.getElementById('joromi-2fa-btn');
    var joromiBtnMobile = document.getElementById('joromi-2fa-btn-mobile');
    if (joromiBtn)
      joromiBtn.addEventListener('click', function (e) {
        e.preventDefault();
        setContext('joromi');
        open2FA();
      });
    if (joromiBtnMobile)
      joromiBtnMobile.addEventListener('click', function (e) {
        e.preventDefault();
        setContext('joromi');
        open2FA();
      });

    // Client Login buttons (Industry auth with 2FA)
    var clientLoginBtn = document.getElementById('client-login-2fa-btn');
    var clientLoginBtnMobile = document.getElementById('client-login-2fa-btn-mobile');
    
    console.log('🔧 Client Login buttons found:', {
      desktop: !!clientLoginBtn,
      mobile: !!clientLoginBtnMobile
    });
    
    if (clientLoginBtn) {
      console.log('🔧 Adding event listener to desktop Client Login button');
      clientLoginBtn.addEventListener('click', function (e) {
        console.log('🔧 Desktop Client Login button clicked!');
        e.preventDefault();
        setContext('dashboard');
        openIndustryAuth();
      });
    } else {
      console.log('❌ Desktop Client Login button not found!');
    }
    
    if (clientLoginBtnMobile) {
      console.log('🔧 Adding event listener to mobile Client Login button');
      clientLoginBtnMobile.addEventListener('click', function (e) {
        console.log('🔧 Mobile Client Login button clicked!');
        e.preventDefault();
        setContext('dashboard');
        openIndustryAuth();
      });
    } else {
      console.log('❌ Mobile Client Login button not found!');
    }
  });
})();


