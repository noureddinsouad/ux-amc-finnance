/* Sidebar interactivity — vanilla JS, no dependency.
 * - collapse/expand with state persisted in localStorage
 * - accordion sub-menus
 * - mobile overlay (open via any [data-sidebar-open] button, e.g. a topbar hamburger)
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'gridapp.sidebar.collapsed';

  function init() {
    var sidebar = document.getElementById('appSidebar');
    if (!sidebar) return;

    // Restore persisted collapse state (desktop only)
    if (window.innerWidth > 768 &&
        localStorage.getItem(STORAGE_KEY) === 'true') {
      document.body.classList.add('sidebar-collapsed');
    }

    // Collapse toggle
    var toggle = sidebar.querySelector('[data-sidebar-toggle]');
    if (toggle) {
      toggle.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          document.body.classList.remove('sidebar-open');
          return;
        }
        var collapsed = document.body.classList.toggle('sidebar-collapsed');
        localStorage.setItem(STORAGE_KEY, collapsed);
      });
    }

    // Sub-menu accordions
    sidebar.querySelectorAll('[data-submenu-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.closest('.nav-group');
        var open = group.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
      });
      // Sync aria-expanded with server-rendered .open state
      if (btn.closest('.nav-group').classList.contains('open')) {
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Mobile: open via hamburger, close via scrim / Escape
    var scrim = document.createElement('div');
    scrim.className = 'sidebar-scrim';
    scrim.addEventListener('click', function () {
      document.body.classList.remove('sidebar-open');
    });
    document.body.appendChild(scrim);

    document.querySelectorAll('[data-sidebar-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.body.classList.add('sidebar-open');
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.body.classList.remove('sidebar-open');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
