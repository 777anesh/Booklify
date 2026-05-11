(function () {
  document.querySelectorAll('[data-category-strip]').forEach((root) => {
    const active = root.querySelector('.category-strip__item--active');
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  });
})();
