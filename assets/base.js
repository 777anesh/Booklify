(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function formatMoney(cents, currency) {
    const code = currency || window.Shopify?.currency?.active || 'USD';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(cents / 100);
    } catch {
      return (cents / 100).toFixed(2);
    }
  }

  async function fetchCart() {
    const res = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('cart');
    return res.json();
  }

  async function addItems(items) {
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw err;
    }
    return res.json();
  }

  async function changeLine(key, quantity) {
    const res = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: key, quantity }),
    });
    if (!res.ok) throw new Error('change');
    return res.json();
  }

  function parseCentsFromMoneySettings() {
    const el = qs('[data-free-shipping-threshold]');
    if (!el) return null;
    const raw = el.getAttribute('data-free-shipping-threshold');
    const n = Number.parseFloat(raw);
    if (Number.isNaN(n)) return null;
    return Math.round(n * 100);
  }

  class CartDrawer {
    constructor(root) {
      this.root = root;
      this.dialog = qs('[data-cart-drawer-dialog]', root);
      this.overlay = qs('[data-cart-drawer-overlay]', root);
      this.body = qs('[data-cart-drawer-body]', root);
      this.subtotalEl = qs('[data-cart-drawer-subtotal]', root);
      this.countEl = qs('[data-cart-count]', document);
      this.progress = qs('[data-cart-free-shipping]', root);
      this.progressLabel = qs('[data-cart-free-shipping-label]', root);
      this.thresholdCents = parseCentsFromMoneySettings();

      this.bind();
    }

    bind() {
      qsa('[data-cart-open]').forEach((btn) =>
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        })
      );

      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.close());
      }

      document.addEventListener('booklify:cart:refresh', () => this.render());

      this.root.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('[data-cart-remove]');
        if (removeBtn) {
          e.preventDefault();
          const key = removeBtn.getAttribute('data-cart-remove');
          this.updateLine(key, 0);
          return;
        }

        const dec = e.target.closest('[data-cart-dec]');
        const inc = e.target.closest('[data-cart-inc]');
        if (dec || inc) {
          e.preventDefault();
          const line = (dec || inc).closest('[data-cart-line]');
          if (!line) return;
          const key = line.getAttribute('data-line-key');
          const qty = Number(line.getAttribute('data-line-qty') || '1');
          const next = inc ? qty + 1 : Math.max(0, qty - 1);
          this.updateLine(key, next);
        }
      });
    }

    open() {
      if (!this.dialog) return;
      this.dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
      this.render();
      window.dispatchEvent(new CustomEvent('booklify:cart:opened'));
    }

    close() {
      if (!this.dialog) return;
      this.dialog.close();
      document.documentElement.style.overflow = '';
      window.dispatchEvent(new CustomEvent('booklify:cart:closed'));
    }

    async render() {
      try {
        const cart = await fetchCart();
        this.paint(cart);
      } catch {
        if (this.body) this.body.innerHTML = '';
      }
    }

    paint(cart) {
      if (this.countEl) {
        this.countEl.textContent = String(cart.item_count || 0);
        this.countEl.hidden = cart.item_count === 0;
      }

      if (this.subtotalEl) {
        this.subtotalEl.textContent = formatMoney(cart.total_price, cart.currency);
      }

      if (this.thresholdCents && this.progress && this.progressLabel) {
        const pct = Math.min(100, Math.round((cart.total_price / this.thresholdCents) * 100));
        this.progress.style.width = `${pct}%`;
        const remaining = Math.max(0, this.thresholdCents - cart.total_price);
        if (remaining > 0) {
          const label = window.theme?.freeShippingRemaining || '';
          this.progressLabel.textContent = label.replace('[[amount]]', formatMoney(remaining, cart.currency));
        } else {
          this.progressLabel.textContent = window.theme?.freeShippingMet || '';
        }
      }

      if (!this.body) return;

      if (!cart.items.length) {
        this.body.innerHTML = `<p class="text-secondary">${window.theme?.cartEmpty || ''}</p>`;
        return;
      }

      this.body.innerHTML = cart.items
        .map((item) => {
          const img = item.image
            ? `<img src="${item.image}" alt="" width="72" height="72" loading="lazy" class="cart-drawer__thumb">`
            : `<div class="cart-drawer__thumb cart-drawer__thumb--placeholder"></div>`;
          return `
            <div class="cart-drawer__line" data-cart-line data-line-key="${item.key}" data-line-qty="${item.quantity}">
              ${img}
              <div class="cart-drawer__line-main">
                <a href="${item.url}" class="cart-drawer__title">${item.product_title}</a>
                <div class="cart-drawer__meta text-muted">${item.variant_title || ''}</div>
                <div class="cart-drawer__controls">
                  <div class="qty">
                    <button type="button" data-cart-dec aria-label="decrease">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-cart-inc aria-label="increase">+</button>
                  </div>
                  <button type="button" class="link" data-cart-remove="${item.key}">${window.theme?.removeLabel || 'Remove'}</button>
                </div>
              </div>
              <div class="cart-drawer__price">${formatMoney(item.final_line_price, cart.currency)}</div>
            </div>
          `;
        })
        .join('');
    }

    async updateLine(key, quantity) {
      try {
        const cart = await changeLine(key, quantity);
        this.paint(cart);
      } catch {
        await this.render();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const drawerRoot = qs('[data-cart-drawer]');
    if (drawerRoot) {
      window.booklifyCart = new CartDrawer(drawerRoot);
    }

    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-add-to-cart]');
      if (!btn) return;
      if (btn.disabled) return;
      e.preventDefault();
      const id = btn.getAttribute('data-variant-id');
      if (!id) return;
      const qty = Number(btn.getAttribute('data-quantity') || '1');
      btn.disabled = true;
      try {
        await addItems([{ id: Number(id), quantity: qty }]);
        document.dispatchEvent(new CustomEvent('booklify:cart:refresh'));
        window.booklifyCart?.open();
      } catch (err) {
        console.error(err);
      } finally {
        btn.disabled = false;
      }
    });
  });
})();
