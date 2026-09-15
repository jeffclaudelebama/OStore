(function () {
   var translations = {
      fr: {
         nav: {
            home: 'Accueil',
            shop: 'Boutique',
            track: 'Suivi',
            cart: 'Panier',
            profile: 'Profil'
         },
         header: {
            delivery: 'Livraison express Libreville & Retrait boutique',
            search: 'Rechercher un iPhone, MacBook, drone, accessoire...',
            categories: 'Catégories tech',
            deals: 'Bonnes affaires tech'
         },
         actions: {
            add: 'Ajouter',
            likeNew: 'Comme neuf',
            veryGood: 'Très bon état',
            gradeA: 'Grade A+',
            viewAll: 'Voir tout',
            cartEmpty: '0 article',
            confirm: 'Confirmer la commande',
            checkout: 'Procéder au paiement'
         },
         checkout: {
            title: 'Finaliser la commande',
            delivery: 'Livraison',
            fullName: 'Nom complet',
            phone: 'Contact WhatsApp / Téléphone',
            location: 'Quartier / Ville',
            instructions: 'Instructions de livraison',
            payment: 'Mode de paiement',
            mobileMoney: 'Airtel Money / Moov Money',
            cash: 'Paiement à la livraison (Cash)'
         }
      },
      en: {
         nav: {
            home: 'Home',
            shop: 'Shop',
            track: 'Track',
            cart: 'Cart',
            profile: 'Profile'
         },
         header: {
            delivery: 'Express delivery Libreville & Store pickup',
            search: 'Search for iPhone, MacBook, drone, accessory...',
            categories: 'Tech Categories',
            deals: 'Hot Tech Deals'
         },
         actions: {
            add: 'ADD',
            likeNew: 'Like New',
            veryGood: 'Very Good',
            gradeA: 'Grade A+',
            viewAll: 'View all',
            cartEmpty: '0 items',
            confirm: 'Confirm order',
            checkout: 'Proceed to checkout'
         },
         checkout: {
            title: 'Checkout',
            delivery: 'Delivery',
            fullName: 'Full name',
            phone: 'WhatsApp / Phone number',
            location: 'District / City',
            instructions: 'Delivery instructions',
            payment: 'Payment method',
            mobileMoney: 'Airtel Money / Moov Money',
            cash: 'Cash on delivery'
         }
      },
      zh: {
         nav: {
            home: '首页',
            shop: '商店',
            track: '订单跟踪',
            cart: '购物车',
            profile: '个人中心'
         },
         header: {
            delivery: '利伯维尔特快配送与自提',
            search: '搜索 iPhone、MacBook、无人机、配件...',
            categories: '数码分类',
            deals: '特惠数码'
         },
         actions: {
            add: '加入购物车',
            likeNew: '近全新',
            veryGood: '成色极佳',
            gradeA: 'A+ 级',
            viewAll: '查看全部',
            cartEmpty: '0 件商品',
            confirm: '确认订单',
            checkout: '去结算'
         },
         checkout: {
            title: '完成订单',
            delivery: '配送',
            fullName: '姓名',
            phone: 'WhatsApp / 电话号码',
            location: '街区 / 城市',
            instructions: '配送说明',
            payment: '付款方式',
            mobileMoney: 'Airtel Money / Moov Money',
            cash: '货到付款'
         }
      }
   };

   var languageKey = 'ostore_lang';

   function getValue(dictionary, key) {
      return key.split('.').reduce(function (value, part) {
         return value && value[part];
      }, dictionary);
   }

   function setLanguage(lang) {
      var selected = translations[lang] ? lang : 'fr';
      var dictionary = translations[selected];
      localStorage.setItem(languageKey, selected);
      document.documentElement.lang = selected;

      document.querySelectorAll('[data-i18n]').forEach(function (element) {
         var value = getValue(dictionary, element.getAttribute('data-i18n'));
         if (typeof value !== 'string') {
            return;
         }
         if (element.matches('input, textarea, select')) {
            element.value = value;
         } else {
            element.textContent = value;
         }
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) {
         var value = getValue(dictionary, element.getAttribute('data-i18n-placeholder'));
         if (typeof value === 'string') {
            element.setAttribute('placeholder', value);
            element.setAttribute('aria-label', value);
         }
      });

      document.querySelectorAll('[data-language-select]').forEach(function (select) {
         select.value = selected;
      });
   }

   function addLanguageSelector() {
      var host = document.querySelector('.homepage-navbar, .cart > div, body > .d-flex > div.bg-primary');
      if (!host || host.querySelector('[data-language-select]')) {
         return;
      }
      var wrapper = document.createElement('div');
      wrapper.className = 'dropdown ms-2';
      wrapper.innerHTML = '<select class="form-select form-select-sm bg-dark text-white border-secondary" aria-label="Language" data-language-select><option value="fr">FR</option><option value="en">EN</option><option value="zh">中文</option></select>';
      var target = host.querySelector('.ms-auto');
      if (target) {
         target.appendChild(wrapper);
      } else {
         host.appendChild(wrapper);
      }
      var select = wrapper.querySelector('select');
      select.addEventListener('change', function () {
         setLanguage(select.value);
      });
   }

   function annotateNavigation() {
      document.querySelectorAll('a[href]').forEach(function (link) {
         var href = link.getAttribute('href');
         var key = href === 'index.html' ? 'nav.home' :
            href === 'listing.html' ? 'nav.shop' :
               href === 'track-order.html' || href === 'track-delivery-boy.html' ? 'nav.track' :
                  href === 'cart.html' ? 'nav.cart' :
                     href === 'profile.html' ? 'nav.profile' : null;
         if (!key || link.querySelector('[data-i18n]')) {
            return;
         }
         var textNode = Array.prototype.find.call(link.childNodes, function (node) {
            return node.nodeType === 3 && node.textContent.trim();
         });
         if (textNode) {
            var label = document.createElement('span');
            label.setAttribute('data-i18n', key);
            label.textContent = textNode.textContent.trim();
            textNode.parentNode.replaceChild(label, textNode);
         }
      });
   }

   function annotateCommonText() {
      var textKeys = {
         'ADD': 'actions.add',
         'Ajouter': 'actions.add',
         'View all': 'actions.viewAll',
         'Voir tout': 'actions.viewAll',
         'Comme neuf': 'actions.likeNew',
         'Like New': 'actions.likeNew',
         'Très bon état': 'actions.veryGood',
         'Very Good': 'actions.veryGood',
         'Grade A+': 'actions.gradeA'
      };
      document.querySelectorAll('body *:not(.all-cate *):not(#categories *)').forEach(function (element) {
         if (element.children.length || element.hasAttribute('data-i18n')) {
            return;
         }
         var key = textKeys[element.textContent.trim()];
         if (key) {
            element.setAttribute('data-i18n', key);
         }
      });
   }

   window.OstoreI18n = {
      translations: translations,
      setLanguage: setLanguage
   };

   document.addEventListener('DOMContentLoaded', function () {
      addLanguageSelector();
      annotateNavigation();
      annotateCommonText();
      setLanguage(localStorage.getItem(languageKey) || 'fr');
   });
}());
