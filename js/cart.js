(function () {
   'use strict';

   var STORAGE_KEY = 'ostore_cart';
   var DELIVERY_FEE = 0;

   function readCart() {
      try {
         var cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
         return Array.isArray(cart) ? cart : [];
      } catch (error) {
         return [];
      }
   }

   function formatPrice(value) {
      return new Intl.NumberFormat('fr-FR').format(Number(value) || 0) + ' FCFA';
   }

   function getCartTotal() {
      return readCart().reduce(function (total, item) {
         return total + (Number(item.price) || 0) * (Number(item.quantity) || 0);
      }, 0);
   }

   function getCartCount() {
      return readCart().reduce(function (count, item) {
         return count + (Number(item.quantity) || 0);
      }, 0);
   }

   function provideInteractionFeedback() {
      if (navigator.vibrate) {
         navigator.vibrate(35);
      }
      var bar = document.getElementById('ostore-cart-bar');
      if (bar) {
         bar.classList.remove('ostore-cart-bar--pulse');
         void bar.offsetWidth;
         bar.classList.add('ostore-cart-bar--pulse');
      }
   }

   function showCartToast(isProductDetail) {
      var toast = document.getElementById('ostore-cart-toast');
      if (!toast) {
         toast = document.createElement('div');
         toast.id = 'ostore-cart-toast';
         toast.className = 'ostore-toast';
         toast.setAttribute('role', 'status');
         toast.setAttribute('aria-live', 'polite');
         document.body.appendChild(toast);
      }
      toast.innerHTML = isProductDetail ?
         'Produit ajouté au panier <a href="cart.html">Voir le panier →</a>' :
         'Article ajouté au panier';
      toast.classList.remove('ostore-toast--visible');
      void toast.offsetWidth;
      toast.classList.add('ostore-toast--visible');
      window.clearTimeout(toast.hideTimer);
      toast.hideTimer = window.setTimeout(function () {
         toast.classList.remove('ostore-toast--visible');
      }, 1800);
   }

   function persist(cart) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      syncCartUI();
      renderCart();
      syncProductControls();
   }

   function addToCart(product) {
      if (!product || !product.id || !product.name || !Number(product.price)) {
         return;
      }
      var cart = readCart();
      var existing = cart.find(function (item) { return item.id === String(product.id); });
      if (existing) {
         existing.quantity += 1;
      } else {
         cart.push({
            id: String(product.id),
            name: String(product.name),
            price: Number(product.price),
            image: product.image || 'img/favicon.png',
            condition: product.condition || 'Grade A+',
            quantity: 1
         });
      }
      persist(cart);
      provideInteractionFeedback();
      showCartToast(Boolean(document.querySelector('.product-details')));
   }

   function updateQuantity(productId, delta) {
      var cart = readCart();
      var item = cart.find(function (entry) { return entry.id === String(productId); });
      if (!item) {
         return;
      }
      item.quantity += Number(delta) || 0;
      if (item.quantity <= 0) {
         cart = cart.filter(function (entry) { return entry.id !== String(productId); });
      }
      persist(cart);
      provideInteractionFeedback();
      showCartToast(Boolean(document.querySelector('.product-details')));
   }

   function removeFromCart(productId) {
      persist(readCart().filter(function (item) { return item.id !== String(productId); }));
   }

   function syncCartUI() {
      var count = getCartCount();
      var total = formatPrice(getCartTotal());
      document.querySelectorAll('[data-cart-count]').forEach(function (node) {
         node.textContent = count + (count === 1 ? ' article' : ' articles');
      });
      document.querySelectorAll('[data-cart-total]').forEach(function (node) {
         node.textContent = total;
      });
      document.querySelectorAll('[data-cart-summary]').forEach(function (node) {
         node.textContent = count + (count === 1 ? ' article - ' : ' articles - ') + total;
      });
      var bar = document.getElementById('ostore-cart-bar');
      if (bar) {
         bar.hidden = count === 0;
      }
   }

   function productFromCard(button) {
      var card = button.closest('.top-picks-item, .card');
      var title = card && card.querySelector('.card-title');
      var price = card && card.querySelector('.card-footer h6.fw-bold');
      var image = card && card.querySelector('img');
      var badge = card && card.querySelector('.osahan-badge b');
      var dataset = button.dataset;
      var product = {
         id: dataset.id || dataset.productId,
         name: dataset.name || dataset.productName,
         price: Number(dataset.price || dataset.productPrice),
         image: dataset.img || dataset.productImage,
         condition: dataset.condition || dataset.productCondition
      };
      product.id = product.id || (title ? title.textContent.trim().toLowerCase().replace(/[^\w]+/g, '-') : 'tech-product');
      product.name = product.name || (title ? title.textContent.trim() : 'Produit tech');
      product.price = product.price || (price ? Number(price.textContent.replace(/[^\d]/g, '')) : 0);
      product.image = product.image || (image ? image.getAttribute('src') : 'img/favicon.png');
      product.condition = product.condition || (badge ? badge.textContent.trim() : 'Grade A+');
      return product;
   }

   function quantityControls(product, quantity) {
      var wrapper = document.createElement('div');
      var isProductDetail = Boolean(document.querySelector('.product-details'));
      wrapper.className = 'ostore-product-actions d-flex align-items-center gap-2' +
         (isProductDetail ? ' flex-wrap' : '');
      wrapper.dataset.productId = product.id;
      wrapper.dataset.productName = product.name;
      wrapper.dataset.productPrice = product.price;
      wrapper.dataset.productImage = product.image;
      wrapper.dataset.productCondition = product.condition;
      wrapper.innerHTML = '<div class="ostore-quantity d-flex align-items-center gap-2">' +
         '<button type="button" class="btn btn-dark btn-sm rounded-circle" data-cart-minus aria-label="Diminuer">−</button>' +
         '<span class="fw-bold" data-cart-quantity></span>' +
         '<button type="button" class="btn btn-dark btn-sm rounded-circle" data-cart-plus aria-label="Augmenter">+</button>' +
         '</div>' +
         (isProductDetail ? '<a href="cart.html" class="btn btn-dark flex-grow-1" data-cart-view>Voir le panier</a>' : '');
      wrapper.querySelector('[data-cart-quantity]').textContent = quantity;
      return wrapper;
   }

   function syncProductControls() {
      var cart = readCart();
      document.querySelectorAll('[data-cart-add]').forEach(function (button) {
         var product = productFromCard(button);
         button.dataset.id = product.id;
         button.dataset.name = product.name;
         button.dataset.price = product.price;
         button.dataset.img = product.image;
         button.dataset.condition = product.condition;
         var item = cart.find(function (entry) { return entry.id === product.id; });
         if (item) {
            if (!button.closest('[data-product-id]') || button.hasAttribute('data-cart-add')) {
               button.replaceWith(quantityControls(product, item.quantity));
            }
         }
      });
      document.querySelectorAll('.ostore-product-actions[data-product-id], .ostore-quantity[data-product-id]').forEach(function (control) {
         var item = cart.find(function (entry) { return entry.id === control.dataset.productId; });
         if (!item) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-outline-success fw-bold rounded-3 shadow-sm btn-sm';
            button.setAttribute('data-cart-add', '');
            button.dataset.id = control.dataset.productId;
            button.dataset.name = control.dataset.productName;
            button.dataset.price = control.dataset.productPrice;
            button.dataset.img = control.dataset.productImage;
            button.dataset.condition = control.dataset.productCondition;
            button.textContent = 'ADD';
            if (document.querySelector('.product-details')) {
               button.className = 'btn btn-success w-100 text-uppercase btn-lg fw-bold';
               button.textContent = 'AJOUTER AU PANIER';
            }
            control.replaceWith(button);
         } else {
            var quantity = control.querySelector('[data-cart-quantity]');
            if (quantity) {
               quantity.textContent = item.quantity;
            }
         }
      });
   }

   function renderCart() {
      var container = document.getElementById('cart-items-container');
      if (!container) {
         return;
      }
      var cart = readCart();
      container.innerHTML = '';
      if (!cart.length) {
         container.innerHTML = '<div class="text-center py-4"><p class="text-muted mb-3">Votre panier est vide</p><a href="index.html" class="btn btn-dark rounded-3">Retour à l’accueil</a></div>';
      } else {
         cart.forEach(function (item) {
            var row = document.createElement('div');
            row.className = 'd-flex align-items-center gap-3 justify-content-between mb-3';
            row.dataset.productId = item.id;
            row.innerHTML = '<img class="img-fluid bg-light p-1 border rounded-3 cart-product" alt="">' +
               '<div class="me-auto"><p class="osahan-mb-1 fw-bold cart-name"></p><p class="text-muted small m-0 cart-condition"></p><p class="small fw-bold m-0 cart-unit-price"></p></div>' +
               '<div class="d-flex align-items-center gap-2 border border-dark-subtle rounded-pill h6 m-0 p-1"><button type="button" class="border-0 bg-transparent" data-cart-minus aria-label="Diminuer">−</button><span class="small cart-quantity"></span><button type="button" class="border-0 bg-transparent" data-cart-plus aria-label="Augmenter">+</button></div>' +
               '<div class="text-end"><p class="small fw-bold m-0 cart-line-total"></p><button type="button" class="btn btn-link text-dark p-0" data-cart-remove>Supprimer</button></div>';
            row.querySelector('img').src = item.image;
            row.querySelector('img').alt = item.name;
            row.querySelector('.cart-name').textContent = item.name;
            row.querySelector('.cart-condition').textContent = item.condition;
            row.querySelector('.cart-unit-price').textContent = formatPrice(item.price);
            row.querySelector('.cart-quantity').textContent = item.quantity;
            row.querySelector('.cart-line-total').textContent = formatPrice(item.price * item.quantity);
            container.appendChild(row);
         });
      }
      document.querySelectorAll('[data-cart-subtotal]').forEach(function (node) {
         node.textContent = formatPrice(getCartTotal());
      });
      document.querySelectorAll('[data-cart-delivery]').forEach(function (node) {
         node.textContent = DELIVERY_FEE ? formatPrice(DELIVERY_FEE) : 'Gratuit / Retrait boutique';
      });
      document.querySelectorAll('[data-cart-grand-total]').forEach(function (node) {
         node.textContent = formatPrice(getCartTotal() + DELIVERY_FEE);
      });
      document.querySelectorAll('[data-cart-checkout]').forEach(function (button) {
         button.classList.toggle('disabled', !cart.length);
         button.setAttribute('aria-disabled', !cart.length ? 'true' : 'false');
      });
   }

   document.addEventListener('click', function (event) {
      var addButton = event.target.closest('[data-cart-add]');
      if (addButton) {
         event.preventDefault();
         addToCart(productFromCard(addButton));
         return;
      }
      var control = event.target.closest('[data-cart-minus], [data-cart-plus]');
      if (control) {
         event.preventDefault();
         var row = control.closest('[data-product-id]');
         if (row) {
            updateQuantity(row.dataset.productId, control.hasAttribute('data-cart-plus') ? 1 : -1);
         }
         return;
      }
      var remove = event.target.closest('[data-cart-remove]');
      if (remove) {
         var removable = remove.closest('[data-product-id]');
         if (removable) {
            removeFromCart(removable.dataset.productId);
         }
      }
   });

   window.addToCart = addToCart;
   window.updateQuantity = updateQuantity;
   window.getCartTotal = getCartTotal;
   window.getCartCount = getCartCount;
   window.syncCartUI = syncCartUI;

   document.addEventListener('DOMContentLoaded', function () {
      syncCartUI();
      renderCart();
      syncProductControls();

      var progress = document.createElement('div');
      progress.className = 'ostore-navigation-progress';
      progress.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progress);
      document.addEventListener('click', function (event) {
         var link = event.target.closest('a[href]');
         if (!link || link.target === '_blank' || link.hasAttribute('download')) {
            return;
         }
         var href = link.getAttribute('href');
         if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) {
            return;
         }
         progress.classList.remove('ostore-navigation-progress--active');
         void progress.offsetWidth;
         progress.classList.add('ostore-navigation-progress--active');
      });
   });
}());
