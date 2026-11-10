# ux-amc-finnance

Reusable Thymeleaf UI components for the AMC Finance / GridApp DSF back-office.

## Structure

```
src/main/resources/
├── templates/
│   ├── fragments/
│   │   ├── sidebar.html      # sidebar(activeMenu)
│   │   ├── topbar.html       # topbar(title, crumb, invDate, invStatus, initials)
│   │   ├── kpis.html         # kpiCard(label, value, delta, tone)
│   │   ├── reports.html      # reportGroup(title, tag, items, progressPct, sectionLabel)
│   │   ├── users.html        # usersTable(users)
│   │   └── user-edit.html    # userEditForm(user)
│   ├── index.html            # demo dashboard composing all fragments
│   ├── users.html            # user management page
│   └── user-edit.html        # user edit page
└── static/
    ├── css/                  # one stylesheet per component
    │   ├── sidebar.css
    │   ├── topbar.css
    │   ├── kpi.css
    │   ├── reports.css
    │   ├── users.css
    │   └── user-edit.css
    └── js/
        ├── sidebar.js        # sidebar interactivity (vanilla JS, no dependency)
        ├── topbar.js         # user dropdown interactivity
        ├── users.js          # users table: search, sort, pagination
        └── user-edit.js      # edit form: toggle switch, validation
```

## Components

### Sidebar — interactive

```html
<div th:replace="~{fragments/sidebar :: sidebar('dsf')}"></div>
```

| Feature | How |
|---|---|
| Collapse / expand | `⟨` button — state persisted in `localStorage` |
| Sub-menus | `[data-submenu-toggle]` parents open accordions |
| Active item | driven by the `activeMenu` fragment parameter |
| Tooltips (collapsed) | from each item's `data-tooltip` attribute |
| Mobile overlay | any button with `data-sidebar-open`; scrim / `Esc` closes |

### Topbar

```html
<header th:replace="~{fragments/topbar :: topbar(
    'Automatisation DSF', 'Home / Batch DSF', '30/09/2022', 'OUVERT', 'NS')}"></header>
```

Breadcrumb + title, inventory date pill, status pill (`OUVERT` → green, otherwise red),
user avatar. Includes the mobile hamburger wired to the sidebar.

**User dropdown**: clicking the avatar opens a menu (name/role header, "Changer le
mot de passe", "Mon profil", and a red **Logout** posted via `@{/logout}`).
Closes on outside click or `Esc`; keyboard accessible (`aria-expanded`, focus return).
Driven by `static/js/topbar.js` — include it after the sidebar script.

### KPI card

```html
<div class="kpi-grid">
  <div th:replace="~{fragments/kpis :: kpiCard('Rapports générés', '13 / 21', '▲ 62% du lot', 'ok')}"></div>
</div>
```

`tone`: `ok` (green) | `warn` (amber) | `error` (red) | empty (neutral).

### Report group

```html
<section th:replace="~{fragments/reports :: reportGroup(
    'DSF ACAPS — Génération des Rapports', '13 rapports', ${rapportsAcaps}, 62, 'Dossiers ACAPS')}"></section>
```

`items`: list of `{ code, name, sub, state }` with `state` = `done` | `pending` | `na`.
Renders status badge + per-report ▶ run button (`data-report-code` attribute for JS hooks).
Pass `progressPct = null` to hide the progress bar.

### Users table

```html
<div th:replace="~{fragments/users :: usersTable(${users})}"></div>
```

`users`: list of `{ id, name, email, initials, role, active, lastLogin }` with
`role` = `admin` | `user` | `auditor`. The table is interactive out of the box:
live search across all columns, click-to-sort headers (dates in `dd/mm/yyyy` are
sorted chronologically), and client-side pagination (`data-page-size`, default 8).
Row action buttons carry `data-user-id` for JS hooks (edit / reset password / delete).
Demo page: `templates/users.html`.

### User edit form

The ✏️ button of each row links to `/users/edit/{id}` (Thymeleaf `@{/users/edit/{id}(id=*{id})}`).

```html
<div th:replace="~{fragments/user-edit :: userEditForm(${user})}"></div>
```

`user`: `{ id, name, email, role, active }`. The form POSTs back to
`/users/edit/{id}` with `name`, `email`, `role`, `active` fields. Includes an
accessible toggle switch for the account status, client-side validation
(required + email format), Annuler → back to the list, and a reset-password
action. Demo page: `templates/user-edit.html` (preview: `user-edit.html?id=1`).

## Theming

Every component exposes CSS variables in `:root` (`--sb-*`, `--tb-*`, `--kpi-*`, `--rg-*`).

## Static preview

Natural templating: open `src/main/resources/templates/index.html` directly in a
browser — the fallback markup renders the full dashboard without a Spring server.
