(function () {
  const root = document.querySelector('[data-featured-product]');
  if (!root) return;

  const main = root.querySelector('[data-featured-main-image] img');
  root.querySelectorAll('.featured-product__thumb').forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-featured-src');
      if (src && main) main.setAttribute('src', src);
      root.querySelectorAll('.featured-product__thumb').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  const qty = root.querySelector('[data-fq-input]');
  root.querySelector('[data-fq-dec]')?.addEventListener('click', () => {
    if (!qty) return;
    qty.value = String(Math.max(1, Number(qty.value || '1') - 1));
    syncQty();
  });
  root.querySelector('[data-fq-inc]')?.addEventListener('click', () => {
    if (!qty) return;
    qty.value = String(Math.max(1, Number(qty.value || '1') + 1));
    syncQty();
  });

  const atc = root.querySelector('.js-featured-atc');
  const sticky = root.querySelector('[data-featured-sticky]');
  const stickyBtn = root.querySelector('[data-featured-sticky-add]');

  function syncQty() {
    const q = qty ? Number(qty.value || '1') : 1;
    if (atc) atc.setAttribute('data-quantity', String(q));
  }
  qty?.addEventListener('input', syncQty);
  syncQty();

  async function addFromVariant(variantId) {
    const q = qty ? Number(qty.value || '1') : 1;
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: [{ id: Number(variantId), quantity: q }] }),
    });
    if (!res.ok) throw new Error('add');
    document.dispatchEvent(new CustomEvent('booklify:cart:refresh'));
    window.booklifyCart?.open();
  }

  atc?.addEventListener('click', async (e) => {
    e.preventDefault();
    const id = atc.getAttribute('data-variant-id');
    if (!id) return;
    try {
      await addFromVariant(id);
    } catch {
      // ignore
    }
  });

  stickyBtn?.addEventListener('click', async () => {
    const id = stickyBtn.getAttribute('data-variant-id');
    if (!id) return;
    try {
      await addFromVariant(id);
    } catch {
      // ignore
    }
  });

  if (sticky && atc) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sticky.classList.remove('is-visible');
          sticky.setAttribute('aria-hidden', 'true');
        } else {
          sticky.classList.add('is-visible');
          sticky.setAttribute('aria-hidden', 'false');
        }
      },
      { threshold: 0.02 }
    );
    io.observe(atc);
  }
})();
