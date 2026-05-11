(function () {
  const root = document.querySelector('[data-main-product]');
  if (!root) return;

  const form = root.querySelector('.main-product__form');
  const variantSelect = root.querySelector('[data-variant-select]');
  const pills = Array.from(root.querySelectorAll('[data-variant-pills] [data-variant-id]'));
  const mainImageWrap = root.querySelector('[data-main-image]');
  const mainImage = mainImageWrap?.querySelector('img');
  const thumbs = Array.from(root.querySelectorAll('.main-product__thumb'));
  const sticky = root.querySelector('[data-sticky-atc]');
  const stickyBtn = root.querySelector('[data-sticky-add]');
  const mainAtc = root.querySelector('.js-main-atc');
  const qtyInput = root.querySelector('[data-qty-input]');

  function getSelectedVariantId() {
    if (!variantSelect) return null;
    return Number(variantSelect.value);
  }

  function setStickyVariant(id) {
    if (!stickyBtn) return;
    stickyBtn.setAttribute('data-variant-id', String(id));
  }

  function setMainAtcVariant(id) {
    if (!mainAtc) return;
    mainAtc.setAttribute('data-variant-id', String(id));
  }

  thumbs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-media-src');
      if (src && mainImage) {
        mainImage.setAttribute('src', src);
      }
      thumbs.forEach((t) => t.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      if (pill.disabled) return;
      const id = pill.getAttribute('data-variant-id');
      if (!variantSelect || !id) return;
      variantSelect.value = id;
      variantSelect.dispatchEvent(new Event('change', { bubbles: true }));
      pills.forEach((p) => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      setStickyVariant(id);
      setMainAtcVariant(id);
    });
  });

  variantSelect?.addEventListener('change', () => {
    const id = getSelectedVariantId();
    if (!id) return;
    setStickyVariant(id);
    setMainAtcVariant(id);
  });

  root.querySelector('[data-qty-dec]')?.addEventListener('click', () => {
    if (!qtyInput) return;
    const next = Math.max(1, Number(qtyInput.value || '1') - 1);
    qtyInput.value = String(next);
  });

  root.querySelector('[data-qty-inc]')?.addEventListener('click', () => {
    if (!qtyInput) return;
    const next = Math.max(1, Number(qtyInput.value || '1') + 1);
    qtyInput.value = String(next);
  });

  async function addVariantToCart(variantId) {
    const qty = Number(qtyInput?.value || '1');
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: [{ id: variantId, quantity: qty }] }),
    });
    if (!res.ok) throw new Error('add');
    document.dispatchEvent(new CustomEvent('booklify:cart:refresh'));
    window.booklifyCart?.open();
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = getSelectedVariantId();
    if (!id) return;
    try {
      await addVariantToCart(id);
    } catch {
      form.submit();
    }
  });

  stickyBtn?.addEventListener('click', async () => {
    const id = Number(stickyBtn.getAttribute('data-variant-id'));
    if (!id) return;
    try {
      await addVariantToCart(id);
    } catch {
      // ignore
    }
  });

  if (sticky && mainAtc) {
    const io = new IntersectionObserver(
      ([entry]) => {
        const hide = document.querySelector('[data-cart-drawer-dialog]')?.open;
        if (hide) {
          sticky.classList.remove('is-visible');
          sticky.setAttribute('aria-hidden', 'true');
          return;
        }
        if (entry.isIntersecting) {
          sticky.classList.remove('is-visible');
          sticky.setAttribute('aria-hidden', 'true');
        } else {
          sticky.classList.add('is-visible');
          sticky.setAttribute('aria-hidden', 'false');
        }
      },
      { root: null, threshold: 0.01 }
    );
    io.observe(mainAtc);

    window.addEventListener('booklify:cart:opened', () => {
      sticky.classList.remove('is-visible');
    });
    window.addEventListener('booklify:cart:closed', () => {
      io.observe(mainAtc);
    });
  }
})();
