(function () {
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function parseEnd(value) {
    if (!value) return null;
    const t = Date.parse(value);
    if (Number.isNaN(t)) return null;
    return t;
  }

  function formatCountdown(ms) {
    if (ms <= 0) return '00:00:00';
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function init(root) {
    const endAttr = root.getAttribute('data-end');
    const enableTimer = root.getAttribute('data-enable-timer') === 'true';
    const rotateMs = Number(root.getAttribute('data-rotate-ms') || '4000');
    const messages = [
      root.getAttribute('data-message-1') || '',
      root.getAttribute('data-message-2') || '',
      root.getAttribute('data-message-3') || '',
    ].filter(Boolean);

    const textEl = root.querySelector('[data-announcement-text]');
    const timerEl = root.querySelector('[data-announcement-timer]');
    const end = parseEnd(endAttr);
    let timerActive = Boolean(enableTimer && end && end > Date.now());
    let index = 0;

    function renderMessage(i) {
      if (!textEl) return;
      const msg = messages[i] || '';
      textEl.textContent = msg;
    }

    function tickTimer() {
      if (!timerEl) return;
      if (!timerActive || !end) {
        timerEl.hidden = true;
        return;
      }
      const remaining = end - Date.now();
      if (remaining <= 0) {
        timerActive = false;
        timerEl.hidden = true;
        index = 1;
        if (messages.length > 1) {
          renderMessage(Math.min(index, messages.length - 1));
        }
        return;
      }
      // Far-future end dates (e.g. theme default "no sale") are not meaningful for a countdown.
      const maxCountdownMs = 45 * 24 * 60 * 60 * 1000;
      if (remaining > maxCountdownMs) {
        timerEl.hidden = true;
        return;
      }
      timerEl.hidden = false;
      timerEl.textContent = formatCountdown(remaining);
    }

    tickTimer();
    setInterval(tickTimer, 1000);

    if (messages.length > 1 && textEl) {
      setInterval(() => {
        index = (index + 1) % messages.length;
        textEl.classList.add('is-fading');
        setTimeout(() => {
          renderMessage(index);
          textEl.classList.remove('is-fading');
        }, 180);
      }, rotateMs);
    }

    renderMessage(0);
  }

  document.querySelectorAll('[data-announcement-bar]').forEach(init);
})();
