/* Listing Rapprochement — vanilla JS, no dependency.
 * - row checkbox selection + select-all (with indeterminate state)
 * - enables "Générer écritures compt. de régul" only when ≥1 row selected
 * - live selected-count badge
 * Pagination is server-side: links navigate to /rapprochement?page=N&size=10.
 * Demo mode (body[data-demo]) simulates the server round-trip locally.
 */
(function () {
  'use strict';

  function init() {
    var form = document.querySelector('[data-rapprochement]');
    if (!form) return;

    var selectAll = form.querySelector('[data-select-all]');
    var genBtn    = form.querySelector('[data-generate-btn]');
    var countEl   = form.querySelector('[data-selected-count]');
    var pageInfo  = form.querySelector('[data-page-info]');

    function checks() {
      return Array.prototype.slice.call(form.querySelectorAll('[data-row-check]'));
    }

    function selectedCount() {
      return checks().filter(function (c) { return c.checked; }).length;
    }

    function update() {
      var all = checks();
      var n = selectedCount();
      countEl.textContent = n + (n > 1 ? ' éléments sélectionnés' : ' élément sélectionné');
      countEl.classList.toggle('has-selection', n > 0);
      genBtn.disabled = n === 0;
      selectAll.checked = all.length > 0 && all.every(function (c) { return c.checked; });
      selectAll.indeterminate = !selectAll.checked && all.some(function (c) { return c.checked; });
    }

    selectAll.addEventListener('change', function () {
      checks().forEach(function (c) { c.checked = selectAll.checked; });
      update();
    });

    // delegation: works for rows re-rendered by the demo
    form.addEventListener('change', function (e) {
      if (e.target.matches('[data-row-check]')) update();
    });

    update();

    /* ---------------- Static demo mode ---------------- */
    if (document.body.hasAttribute('data-demo')) {
      var PAGE_SIZE = 10;
      var DATA = window.RAPPROCHEMENT_DEMO_DATA || [];
      var totalPages = Math.max(1, Math.ceil(DATA.length / PAGE_SIZE));

      function rowHtml(it) {
        return '<tr>' +
          '<td>' + it.ref + '</td>' +
          '<td>' + it.date + '</td>' +
          '<td>' + it.lib + '</td>' +
          '<td>' + it.compte + '</td>' +
          '<td class="rap-amount' + (it.neg ? ' rap-amount-neg' : '') + '">' + it.montant + '</td>' +
          '<td><span class="status-badge ' + it.statusClass + '">' + it.status + '</span></td>' +
          '<td class="rap-check-col"><input type="checkbox" name="selectedIds" value="' + it.id +
            '" data-row-check aria-label="Sélectionner ' + it.ref + '"></td>' +
        '</tr>';
      }

      function renderPage(p) {
        form.querySelector('tbody').innerHTML =
          DATA.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE).map(rowHtml).join('');
        pageInfo.textContent = 'Page ' + (p + 1) + ' sur ' + totalPages +
          ' — ' + DATA.length + ' éléments';
        var prev = form.querySelector('a[aria-label="Page précédente"]');
        var next = form.querySelector('a[aria-label="Page suivante"]');
        prev.setAttribute('data-page-link', p - 1);
        next.setAttribute('data-page-link', p + 1);
        prev.classList.toggle('disabled', p === 0);
        next.classList.toggle('disabled', p === totalPages - 1);
        form.querySelectorAll('a[data-page-num]').forEach(function (a) {
          a.classList.toggle('current', parseInt(a.getAttribute('data-page-link'), 10) === p);
        });
        update();
      }

      form.querySelectorAll('.rap-pagination a').forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          if (a.classList.contains('disabled')) return;
          renderPage(parseInt(a.getAttribute('data-page-link'), 10));
        });
      });

      // simulate POST /rapprochement/generer → success flash alert
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var n = selectedCount();
        var stack = document.querySelector('.alerts-stack');
        if (!stack) {
          stack = document.createElement('div');
          stack.className = 'alerts-stack';
          var content = document.querySelector('.content');
          content.insertBefore(stack, content.firstChild);
        }
        var alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.setAttribute('role', 'status');
        alert.setAttribute('data-alert', 'success');
        alert.innerHTML = '<span class="alert-icon">✔</span>' +
          '<div class="alert-body">Écritures comptables de régularisation générées pour <strong>' +
          n + '</strong> élément(s) sélectionné(s).</div>' +
          '<button type="button" class="alert-close" data-alert-close aria-label="Fermer">✕</button>';
        stack.prepend(alert);
        if (window.GridAppAlerts) {
          setTimeout(function () { window.GridAppAlerts.dismiss(alert); }, 6000);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
