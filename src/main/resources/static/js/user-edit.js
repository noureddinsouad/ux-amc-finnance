/* User edit form — vanilla JS, no dependency.
 * - accessible toggle switch synced to a hidden checkbox
 * - light client-side validation (required, email format)
 */
(function () {
  'use strict';

  function init() {
    var form = document.querySelector('[data-user-edit-form]');
    if (!form) return;

    // Toggle switches: <button class="toggle" data-toggle-for="fieldId">
    form.querySelectorAll('[data-toggle-for]').forEach(function (toggle) {
      var input = document.getElementById(toggle.getAttribute('data-toggle-for'));
      toggle.addEventListener('click', function () {
        var on = toggle.getAttribute('aria-checked') !== 'true';
        toggle.setAttribute('aria-checked', on);
        if (input) input.checked = on;
      });
    });

    // Validation
    form.addEventListener('submit', function (e) {
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        var bad = !field.value.trim() ||
          (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
        field.classList.toggle('invalid', bad);
        if (bad) valid = false;
      });
      if (!valid) e.preventDefault();
    });

    form.querySelectorAll('[required]').forEach(function (field) {
      field.addEventListener('input', function () {
        field.classList.remove('invalid');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
