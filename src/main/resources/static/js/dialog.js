/* Confirm dialog — vanilla JS, no dependency.
 * Any element with [data-confirm-open] opens the dialog [data-confirm-dialog].
 * Optional trigger attributes:
 *   data-confirm-id    — appended to the form's data-action-base → action="{base}/{id}"
 *   data-confirm-name  — injected into [data-confirm-name-slot]
 * Close: [data-confirm-cancel], scrim click, or Escape.
 */
(function () {
  'use strict';

  function init() {
    var scrim = document.querySelector('[data-confirm-dialog]');
    if (!scrim) return;

    var form       = scrim.querySelector('form[data-action-base]');
    var nameSlot   = scrim.querySelector('[data-confirm-name-slot]');
    var cancelBtn  = scrim.querySelector('[data-confirm-cancel]');
    var confirmBtn = scrim.querySelector('button[type="submit"]');
    var lastTrigger = null;

    function open(trigger) {
      lastTrigger = trigger;
      var id   = trigger.getAttribute('data-confirm-id');
      var name = trigger.getAttribute('data-confirm-name');
      if (form && id) {
        form.action = form.getAttribute('data-action-base') + '/' + encodeURIComponent(id);
      }
      if (nameSlot) nameSlot.textContent = name ? '« ' + name + ' »' : '';
      scrim.hidden = false;
      confirmBtn.focus();
    }

    function close(refocus) {
      scrim.hidden = true;
      if (refocus && lastTrigger) lastTrigger.focus();
    }

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-confirm-open]');
      if (trigger) { e.preventDefault(); open(trigger); }
    });

    cancelBtn.addEventListener('click', function () { close(true); });

    scrim.addEventListener('click', function (e) {
      if (e.target === scrim) close(true);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !scrim.hidden) close(true);
    });

    // Static preview (no Spring backend): don't navigate on confirm
    if (document.body.hasAttribute('data-demo')) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        close(false);
        if (lastTrigger) {
          var row = lastTrigger.closest('tr');
          if (row) row.remove();
        }
        // let the table component refresh its counts/pagination
        var search = document.querySelector('[data-table-search]');
        if (search) search.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
