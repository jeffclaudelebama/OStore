(function () {
   'use strict';

   var USER_KEY = 'ostore_user';
   var USERS_KEY = 'ostore_users';
   var RETURN_KEY = 'ostore_auth_return';

   function readUsers() {
      try {
         var users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
         return Array.isArray(users) ? users : [];
      } catch (error) {
         return [];
      }
   }

   function saveUsers(users) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
   }

   function profileFromAccount(account) {
      return {
         id: account.id,
         name: account.name,
         email: account.email,
         phone: account.phone,
         city: account.city,
         address: account.address,
         createdAt: account.createdAt
      };
   }

   function normalizeEmail(email) {
      return String(email || '').trim().toLowerCase();
   }

   function getCurrentUser() {
      try {
         return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
      } catch (error) {
         return null;
      }
   }

   function showMessage(message, isError) {
      var node = document.querySelector('[data-auth-message]');
      if (!node) {
         return;
      }
      node.textContent = message;
      node.className = 'small mt-3 ' + (isError ? 'text-danger' : 'text-success');
      node.hidden = false;
   }

   function registerUser(name, email, password, phone) {
      var normalizedEmail = normalizeEmail(email);
      var users = readUsers();
      if (users.some(function (user) { return user.email === normalizedEmail; })) {
         throw new Error('Un compte existe déjà avec cet e-mail.');
      }
      var user = {
         id: 'USR-' + Date.now(),
         name: String(name).trim(),
         email: normalizedEmail,
         phone: String(phone || '').trim(),
         city: '',
         address: '',
         createdAt: new Date().toISOString(),
         password: String(password)
      };
      users.push(user);
      saveUsers(users);
      localStorage.setItem(USER_KEY, JSON.stringify(profileFromAccount(user)));
      window.location.href = 'my-account.html';
      return user;
   }

   function loginUser(email, password) {
      var normalizedEmail = normalizeEmail(email);
      var user = readUsers().find(function (entry) {
         return entry.email === normalizedEmail && entry.password === String(password);
      });
      if (!user) {
         throw new Error('E-mail ou mot de passe incorrect.');
      }
      localStorage.setItem(USER_KEY, JSON.stringify(profileFromAccount(user)));
      var returnTo = localStorage.getItem(RETURN_KEY);
      localStorage.removeItem(RETURN_KEY);
      window.location.href = returnTo || 'my-account.html';
      return user;
   }

   function logoutUser() {
      localStorage.removeItem(USER_KEY);
      window.location.href = 'signin.html';
   }

   function updateProfile(data) {
      var currentUser = getCurrentUser();
      if (!currentUser) {
         return null;
      }
      var updates = data || {};
      var updatedUser = Object.assign({}, currentUser, {
         name: updates.name !== undefined ? String(updates.name).trim() : currentUser.name,
         phone: updates.phone !== undefined ? String(updates.phone).trim() : currentUser.phone,
         city: updates.city !== undefined ? String(updates.city).trim() : currentUser.city,
         address: updates.address !== undefined ? String(updates.address).trim() : currentUser.address
      });
      var users = readUsers().map(function (user) {
         return user.id === updatedUser.id ? Object.assign({}, user, updatedUser) : user;
      });
      saveUsers(users);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
   }

   function initSignup() {
      var form = document.getElementById('signup-form');
      if (!form) {
         return;
      }
      form.addEventListener('submit', function (event) {
         event.preventDefault();
         var data = new FormData(form);
         var name = data.get('name');
         var email = data.get('email');
         var phone = data.get('phone');
         var password = data.get('password');
         if (!String(name || '').trim() || !normalizeEmail(email) || !String(password || '').trim() || !String(phone || '').trim()) {
            showMessage('Renseignez votre nom, e-mail, téléphone et mot de passe.', true);
            return;
         }
         try {
            showMessage('Compte créé, redirection en cours…', false);
            registerUser(name, email, password, phone);
         } catch (error) {
            showMessage(error.message, true);
         }
      });
   }

   function initSignin() {
      var form = document.getElementById('signin-form');
      if (!form) {
         return;
      }
      form.addEventListener('submit', function (event) {
         event.preventDefault();
         var data = new FormData(form);
         if (!normalizeEmail(data.get('email')) || !String(data.get('password') || '').trim()) {
            showMessage('Saisissez votre e-mail et votre mot de passe.', true);
            return;
         }
         try {
            loginUser(data.get('email'), data.get('password'));
         } catch (error) {
            showMessage(error.message, true);
         }
      });
   }

   function initAccount() {
      var account = document.querySelector('[data-account-page]');
      if (!account && document.body.classList.contains('profile')) {
         window.location.href = 'my-account.html';
         return;
      }
      if (!account) {
         return;
      }
      var user = getCurrentUser();
      if (!user) {
         window.location.href = 'signin.html';
         return;
      }
      document.querySelectorAll('[data-user-name]').forEach(function (node) { node.textContent = user.name; });
      document.querySelectorAll('[data-user-email]').forEach(function (node) { node.textContent = user.email; });
      document.querySelectorAll('[data-user-phone]').forEach(function (node) { node.textContent = user.phone || 'Téléphone non renseigné'; });
      var order = JSON.parse(localStorage.getItem('ostore_last_order') || 'null');
      var orders = document.querySelector('[data-order-history]');
      if (orders) {
         orders.innerHTML = order ? '<div class="border rounded-3 p-3"><strong>' + order.id + '</strong><p class="small text-muted mb-1">' + new Date(order.createdAt).toLocaleString('fr-FR') + '</p><p class="mb-0">Total : ' + new Intl.NumberFormat('fr-FR').format(order.total) + ' FCFA</p></div>' : '<p class="text-muted mb-0">Aucune commande enregistrée.</p>';
      }
      var logout = document.querySelector('[data-logout]');
      if (logout) {
         logout.addEventListener('click', function (event) {
            event.preventDefault();
            logoutUser();
         });
      }
   }

   window.registerUser = registerUser;
   window.loginUser = loginUser;
   window.logoutUser = logoutUser;
   window.getCurrentUser = getCurrentUser;
   window.updateProfile = updateProfile;

   document.addEventListener('DOMContentLoaded', function () {
      initSignup();
      initSignin();
      initAccount();
   });
}());
