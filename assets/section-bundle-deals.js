(function () {
  document.querySelectorAll('[data-bundle-deals]').forEach((root) => {
    const prefix = root.getAttribute('data-discount-prefix') || '';
    if (!prefix) return;

    root.querySelectorAll('[data-bundle-tier]').forEach((link) => {
      const href = link.getAttribute('href');
      const qty = link.getAttribute('data-tier-qty') || '';
      if (!href || !qty) return;

      try {
        const url = new URL(href, window.location.origin);
        url.searchParams.set('discount', `${prefix}${qty}`);
        link.setAttribute('href', url.toString());
      } catch {
        // ignore invalid URLs
      }
    });
  });
})();
