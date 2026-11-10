/* Topbar interactivity — vanilla JS, no dependency.
 * - user avatar dropdown: click to toggle, closes on outside click / Esc
 * - keyboard accessible (aria-expanded, focus return)
 */
(function () {
  'use strict';

  function init() {
    var menu = document.querySelector('[data-user-menu]');
    if (!menu) return;

    var toggle = menu.querySelector('[data-user-menu-toggle]');
    var dropdown = menu.querySelector('.user-dropdown');

    function open() {
      dropdown.hidden = false;
      menu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function close(refocus) {
      dropdown.hidden = true;
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      if (refocus) toggle.focus();
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.hidden ? open() : close(false);
    });

    document.addEventListener('click', function (e) {
      if (!dropdown.hidden && !menu.contains(e.target)) close(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !dropdown.hidden) close(true);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
