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
      console.log('🔧 openIndustryAuth called - redirecting to UnifiedAuthModal');
      
      // Use UnifiedAuthModal instead of IndustryAuthModal
      if (typeof window.openUnifiedAuthModal === 'function') {
        console.log('✅ openUnifiedAuthModal function found, opening...');
        try {
          window.openUnifiedAuthModal();
          closeMenuIfOpen();
          console.log('✅ Unified Auth modal opened successfully');
          return;
        } catch (error) {
          console.error('❌ Error opening Unified Auth modal:', error);
          alert('Authentication service encountered an error. Please try again later.');
          return;
        }
      }
      
      // Fallback: Try openClientLogin if available
      if (typeof window.openClientLogin === 'function') {
        console.log('🔄 Falling back to openClientLogin');
        try {
          window.openClientLogin();
          closeMenuIfOpen();
          return;
        } catch (error) {
          console.error('❌ Error with openClientLogin:', error);
        }
      }
      
      // Final fallback: Try to open modal directly
      const modal = document.getElementById('unified-auth-modal');
      if (modal) {
        console.log('🔄 Opening unified-auth-modal directly via DOM');
        modal.classList.remove('hidden');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        closeMenuIfOpen();
        return;
      }
      
      console.error('❌ Unified Auth modal not available');
      alert('Authentication service is temporarily unavailable. Please refresh the page and try again.');
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


