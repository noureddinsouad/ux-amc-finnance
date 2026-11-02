# ux-amc-finnance

Reusable Thymeleaf UI components for the AMC Finance / GridApp DSF back-office.

## Structure

```
src/main/resources/
├── templates/
│   ├── fragments/
│   │   └── sidebar.html      # sidebar(activeMenu) fragment
│   └── index.html            # demo page
└── static/
    ├── css/sidebar.css       # component styles (CSS variables theming)
    └── js/sidebar.js         # interactivity (no dependency)
```

## Sidebar component

### Usage

Include the fragment in any page and pass the active menu key:

```html
<div th:replace="~{fragments/sidebar :: sidebar('dsf')}"></div>
```

Load the assets once in your layout:

```html
<link rel="stylesheet" th:href="@{/css/sidebar.css}">
<script th:src="@{/js/sidebar.js}" defer></script>
```

### Interactions

| Feature | How |
|---|---|
| Collapse / expand | `⟨` button in the logo row — state persisted in `localStorage` |
| Sub-menus | any `[data-submenu-toggle]` parent opens an accordion |
| Active item | driven by the `activeMenu` fragment parameter (`th:classappend`) |
| Tooltips (collapsed) | from each item's `data-tooltip` attribute |
| Mobile overlay | hamburger with `data-sidebar-open`; scrim / `Esc` closes |

### Theming

Override the CSS variables in `:root` (`--sb-bg`, `--sb-accent`, `--sb-width`, …).

### Static preview

The templates use "natural templating": open
`src/main/resources/templates/index.html` directly in a browser to preview
without a Spring server.
