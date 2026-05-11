(function () {
  const root = document.querySelector('[data-product-tabs]');
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll('[data-tab]'));
  const panels = Array.from(root.querySelectorAll('[data-panel]'));

  function activate(name) {
    tabs.forEach((tab) => {
      const active = tab.getAttribute('data-tab') === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach((panel) => {
      const active = panel.getAttribute('data-panel') === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    try {
      history.replaceState(null, '', `#${name}`);
    } catch {
      // ignore
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab.getAttribute('data-tab')));
  });

  const initial = (location.hash || '').replace('#', '');
  if (initial && tabs.some((t) => t.getAttribute('data-tab') === initial)) {
    activate(initial);
  }
})();
