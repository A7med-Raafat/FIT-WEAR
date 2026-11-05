(() => {
  const WHATSAPP_NUMBER = '201503233355';
  const PHONE_LABEL = '01503233355';
  const cart = JSON.parse(localStorage.getItem('fitwear-cart') || '[]');
  const cards = [...document.querySelectorAll('.product .card')];
  const cartLink = document.querySelector('.buy');
  const searchInput = document.querySelector('#search');

  const money = (value) => `$${Number(value).toFixed(2)}`;
  const getProduct = (card) => ({
    name: card.querySelector('h4')?.textContent.trim() || 'FitWear product',
    price: Number((card.querySelector('.c-info p')?.textContent || '').replace(/[^0-9.]/g, '')) || 0,
    image: card.querySelector('img')?.getAttribute('src') || ''
  });

  const saveCart = () => localStorage.setItem('fitwear-cart', JSON.stringify(cart));
  const cartCount = () => cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);

  function updateCartBadge() {
    if (!cartLink) return;
    let badge = cartLink.querySelector('.cart-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      cartLink.appendChild(badge);
    }
    badge.textContent = cartCount();
    badge.hidden = cartCount() === 0;
    cartLink.setAttribute('aria-label', `Shopping cart, ${cartCount()} items`);
  }

  function showToast(message) {
    let toast = document.querySelector('.fitwear-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'fitwear-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function addToCart(product) {
    const existing = cart.find((item) => item.name === product.name);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    saveCart();
    updateCartBadge();
    showToast(`${product.name} added to your cart`);
  }

  function buildModal() {
    if (document.querySelector('.cart-modal')) return;
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="cart-backdrop" data-close-cart></div>
      <aside class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div class="cart-heading"><h2 id="cart-title">Your FitWear Cart</h2><button class="cart-close" type="button" data-close-cart aria-label="Close cart">&times;</button></div>
        <div class="cart-items"></div>
        <div class="cart-empty">Your cart is empty. Add a product to start your order.</div>
        <div class="cart-footer"><strong>Total: <span class="cart-total">$0.00</span></strong><button class="whatsapp-order" type="button">Order on WhatsApp</button><a class="call-order" href="tel:${PHONE_LABEL}">Call ${PHONE_LABEL}</a></div>
      </aside>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-cart]')) closeCart();
      const removeButton = event.target.closest('[data-remove-item]');
      if (removeButton) removeFromCart(Number(removeButton.dataset.removeItem));
      const quantityButton = event.target.closest('[data-quantity]');
      if (quantityButton) changeQuantity(Number(quantityButton.dataset.quantity), Number(quantityButton.dataset.delta));
      if (event.target.closest('.whatsapp-order')) sendWhatsAppOrder();
    });
  }

  function renderCart() {
    buildModal();
    const modal = document.querySelector('.cart-modal');
    const items = modal.querySelector('.cart-items');
    const empty = modal.querySelector('.cart-empty');
    items.innerHTML = cart.map((item, index) => `
      <div class="cart-item"><img src="${item.image}" alt="${item.name}"><div class="cart-item-info"><strong>${item.name}</strong><span>${money(item.price)} each</span><div class="quantity"><button type="button" data-quantity="${index}" data-delta="-1">−</button><b>${item.quantity}</b><button type="button" data-quantity="${index}" data-delta="1">+</button><button class="remove-item" type="button" data-remove-item="${index}">Remove</button></div></div></div>`).join('');
    empty.hidden = cart.length > 0;
    items.hidden = cart.length === 0;
    modal.querySelector('.cart-total').textContent = money(cartTotal());
  }

  function openCart() { renderCart(); const modal = document.querySelector('.cart-modal'); modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('cart-open'); }
  function closeCart() { const modal = document.querySelector('.cart-modal'); if (!modal) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('cart-open'); }
  function removeFromCart(index) { cart.splice(index, 1); saveCart(); updateCartBadge(); renderCart(); }
  function changeQuantity(index, delta) { if (!cart[index]) return; cart[index].quantity += delta; if (cart[index].quantity <= 0) cart.splice(index, 1); saveCart(); updateCartBadge(); renderCart(); }

  function sendWhatsAppOrder() {
    if (!cart.length) return showToast('Add a product before placing an order');
    const lines = cart.map((item) => `• ${item.name} x${item.quantity} — ${money(item.price * item.quantity)}`);
    const message = `Hello FitWear, I would like to order:\n${lines.join('\n')}\n\nTotal: ${money(cartTotal())}\nPlease confirm availability and delivery details.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  }

  cards.forEach((card) => {
    const button = card.querySelector('.button button');
    if (!button) return;
    button.type = 'button';
    button.removeAttribute('onclick');
    button.addEventListener('click', () => addToCart(getProduct(card)));
  });

  cartLink?.addEventListener('click', (event) => { event.preventDefault(); openCart(); });
  searchInput?.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase().trim();
    cards.forEach((card) => { card.hidden = query && !card.textContent.toLowerCase().includes(query); });
  });
  document.querySelectorAll('.sign-inn, .sign-upp').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); showToast('Account access is coming soon — contact us to order now'); }));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeCart(); });
  updateCartBadge();
})();
