(function () {
  const root = document.querySelector('[data-faq]');
  if (!root) return;

  const mode = root.getAttribute('data-mode') || 'many';
  if (mode !== 'one') return;

  root.querySelectorAll('details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      root.querySelectorAll('details').forEach((other) => {
        if (other !== details) {
          other.open = false;
        }
      });
    });
  });
})();
