(function () {
  const header = document.querySelector('[data-site-header]');
  if (!header) return;

  const sticky = header.getAttribute('data-enable-sticky') === 'true';
  if (sticky) {
    const onScroll = () => {
      if (window.scrollY > 80) {
        header.classList.add('header--sticky');
      } else {
        header.classList.remove('header--sticky');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const openSearch = document.querySelector('[data-open-search]');
  const closeSearch = document.querySelector('[data-close-search]');
  const searchDialog = document.querySelector('[data-search-dialog]');
  if (openSearch && searchDialog) {
    openSearch.addEventListener('click', () => {
      searchDialog.showModal();
      const input = searchDialog.querySelector('input[name="q"]');
      if (input) input.focus();
    });
  }
  if (closeSearch && searchDialog) {
    closeSearch.addEventListener('click', () => searchDialog.close());
  }

  const openNav = document.querySelector('[data-open-nav]');
  const closeNav = document.querySelector('[data-close-nav]');
  const navDialog = document.querySelector('[data-nav-dialog]');
  if (openNav && navDialog) {
    openNav.addEventListener('click', () => navDialog.showModal());
  }
  if (closeNav && navDialog) {
    closeNav.addEventListener('click', () => navDialog.close());
  }
})();
