/* Users table interactivity — vanilla JS, no dependency.
 * - live search filter (all columns)
 * - column sorting (click header, data-type="date" for dd/mm/yyyy)
 * - client-side pagination (data-page-size on the table)
 */
(function () {
  'use strict';

  function init() {
    var card = document.querySelector('[data-users-table]');
    if (!card) return;

    var table    = card.querySelector('.data-table');
    var tbody    = table.tBodies[0];
    var rows     = Array.prototype.slice.call(tbody.rows);
    var searchIn = card.querySelector('[data-table-search]');
    var emptyMsg = card.querySelector('.dt-empty');
    var info     = card.querySelector('[data-page-info]');
    var pager    = card.querySelector('[data-pagination]');
    var pageSize = parseInt(table.getAttribute('data-page-size') || '8', 10);

    var page = 1;
    var sortCol = -1, sortAsc = true;

    function text(row, col) {
      var cell = row.cells[col];
      return cell ? cell.textContent.trim().toLowerCase() : '';
    }

    function parseDate(s) { // dd/mm/yyyy -> comparable
      var p = s.split('/');
      return p.length === 3 ? p[2] + p[1] + p[0] : s;
    }

    function visibleRows() {
      var q = (searchIn.value || '').trim().toLowerCase();
      return rows.filter(function (r) {
        if (!q) return true;
        return r.textContent.toLowerCase().indexOf(q) !== -1;
      });
    }

    function render() {
      var vis = visibleRows();
      var pages = Math.max(1, Math.ceil(vis.length / pageSize));
      if (page > pages) page = pages;

      rows.forEach(function (r) { r.classList.add('hidden-row'); });
      vis.slice((page - 1) * pageSize, page * pageSize)
         .forEach(function (r) { r.classList.remove('hidden-row'); });

      emptyMsg.classList.toggle('visible', vis.length === 0);

      var from = vis.length ? (page - 1) * pageSize + 1 : 0;
      var to = Math.min(page * pageSize, vis.length);
      info.textContent = from + '–' + to + ' sur ' + vis.length + ' utilisateurs';

      // pagination buttons
      pager.innerHTML = '';
      function btn(label, target, opts) {
        opts = opts || {};
        var b = document.createElement('button');
        b.className = 'dt-page-btn' + (opts.current ? ' current' : '');
        b.textContent = label;
        b.disabled = !!opts.disabled;
        if (!opts.disabled && !opts.current) {
          b.addEventListener('click', function () { page = target; render(); });
        }
        pager.appendChild(b);
      }
      btn('‹', page - 1, { disabled: page === 1 });
      for (var p = 1; p <= pages; p++) btn(String(p), p, { current: p === page });
      btn('›', page + 1, { disabled: page === pages });
    }

    // search
    searchIn.addEventListener('input', function () { page = 1; render(); });

    // sorting
    Array.prototype.forEach.call(table.tHead.rows[0].cells, function (th, col) {
      if (th.hasAttribute('data-no-sort')) return;
      th.addEventListener('click', function () {
        var isDate = th.getAttribute('data-type') === 'date';
        sortAsc = (sortCol === col) ? !sortAsc : true;
        sortCol = col;
        Array.prototype.forEach.call(th.parentNode.cells, function (c) {
          c.classList.remove('sorted-asc', 'sorted-desc');
        });
        th.classList.add(sortAsc ? 'sorted-asc' : 'sorted-desc');
        rows.sort(function (a, b) {
          var x = text(a, col), y = text(b, col);
          if (isDate) { x = parseDate(x); y = parseDate(y); }
          return (x < y ? -1 : x > y ? 1 : 0) * (sortAsc ? 1 : -1);
        });
        rows.forEach(function (r) { tbody.appendChild(r); });
        page = 1;
        render();
      });
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
