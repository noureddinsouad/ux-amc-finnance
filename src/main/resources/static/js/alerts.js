/* Alerts — vanilla JS, no dependency.
 * - [data-alert-close] dismisses its alert with a fade
 * - success alerts auto-dismiss after 6s (error alerts stay until closed)
 * - removes the empty .alerts-stack wrapper when the last alert is gone
 */
(function () {
  'use strict';

  var SUCCESS_TIMEOUT = 6000;

  function dismiss(alert) {
    if (!alert || alert.classList.contains('fading')) return;
    alert.classList.add('fading');
    setTimeout(function () {
      var stack = alert.parentElement;
      alert.remove();
      if (stack && stack.classList.contains('alerts-stack') && !stack.children.length) {
        stack.remove();
      }
    }, 300);
  }

  function init() {
    document.querySelectorAll('.alert').forEach(function (alert) {
      var closeBtn = alert.querySelector('[data-alert-close]');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () { dismiss(alert); });
      }
      if (alert.getAttribute('data-alert') === 'success') {
        setTimeout(function () { dismiss(alert); }, SUCCESS_TIMEOUT);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
