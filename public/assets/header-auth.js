// Header auth and menu behavior wired unobtrusively (CSP-friendly)
(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    var btn = document.getElementById('mobile-menu-btn');
    var menu = document.getElementById('mobile-menu');
    var openProductsModal = document.getElementById('open-products-modal');
    var openProductsModalMobile = document.getElementById('open-products-modal-mobile');
    var productsModal = document.getElementById('products-modal');

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

    function redirectToAuthApp() {
      try {
        var target = 'https://tetrix-minimal-uzzxn.ondigitalocean.app';
        window.location.href = target;
      } catch (_) {}
    }

    function openIndustryAuth() {
      if (typeof window.openIndustryAuthModal === 'function') {
        window.openIndustryAuthModal();
        closeMenuIfOpen();
      } else {
        // Fallback: navigate to deployed auth app
        redirectToAuthApp();
      }
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
    if (clientLoginBtn)
      clientLoginBtn.addEventListener('click', function (e) {
        e.preventDefault();
        setContext('dashboard');
        openIndustryAuth();
      });
    if (clientLoginBtnMobile)
      clientLoginBtnMobile.addEventListener('click', function (e) {
        e.preventDefault();
        setContext('dashboard');
        openIndustryAuth();
      });
  });
})();


