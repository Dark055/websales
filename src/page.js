export const HTML_PAGE = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebSales - Парсер продуктів</title>
  <style>
    :root {
      color-scheme: light;
      --bg-page: #F7F8FA;
      --bg-page-accent: radial-gradient(circle at top left, rgba(59,130,246,0.08), transparent 32%);
      --bg-panel: rgba(255,255,255,0.9);
      --bg-card: #FFFFFF;
      --bg-card-secondary: #F1F3F5;
      --bg-card-hover: #F9FAFB;
      --text-main: #1F2933;
      --text-secondary: #6B7280;
      --text-muted: #9CA3AF;
      --accent-primary: #3B82F6;
      --accent-primary-hover: #2563EB;
      --accent-success: #22C55E;
      --accent-warning: #F59E0B;
      --accent-error: #EF4444;
      --divider: #E2E5E9;
      --divider-strong: #D1D5DB;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.07);
      --shadow-lg: 0 10px 30px rgba(0,0,0,0.08);
      --btn-shadow: 0 6px 16px rgba(59,130,246,0.18);
      --focus-ring: rgba(59,130,246,0.15);

      --font-size-sm: 12px;
      --font-size-base: 14px;
      --font-size-md: 16px;
      --font-size-lg: 18px;

      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 12px;
      --radius-xl: 20px;
      --radius-pill: 999px;

      --duration-fast: 120ms;
      --duration-normal: 160ms;
      --duration-slow: 240ms;
      --easing-out: cubic-bezier(.22,.9,.35,1);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--bg-page-accent), var(--bg-page);
      color: var(--text-main);
      font-size: var(--font-size-base);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 20px;
    }

    h1 {
      font-size: 28px;
      font-weight: 600;
      line-height: 1.2;
      color: var(--text-main);
      margin-right: 16px;
      white-space: nowrap;
      letter-spacing: -0.02em;
    }

    /* === Header & Panels === */
    .header {
      background-color: var(--bg-panel);
      backdrop-filter: blur(12px);
      padding: 20px 24px;
      border: 1px solid rgba(255,255,255,0.72);
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: sticky;
      top: 20px;
      z-index: 100;
      box-shadow: var(--shadow-md);
    }

    .header__top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .header__controls {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      flex: 1;
    }

    .header__search {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
      padding: 6px;
      background: var(--bg-card-secondary);
      border: 1px solid var(--divider);
      border-radius: 14px;
    }

    .filters-panel {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
      padding: 16px 18px;
      background: var(--bg-card-secondary);
      border: 1px solid var(--divider);
      border-radius: 16px;
    }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: var(--font-size-base);
      color: var(--text-main);
    }
    .filter-item label {
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    /* === Inputs & Selects === */
    .input {
      background-color: var(--bg-card);
      border: 1px solid var(--divider-strong);
      border-radius: 8px;
      padding: 10px 12px;
      color: var(--text-main);
      font-family: inherit;
      font-size: var(--font-size-base);
      outline: none;
      transition: border-color var(--duration-normal) var(--easing-out), box-shadow var(--duration-normal) var(--easing-out), background-color var(--duration-normal) var(--easing-out);
      min-width: 160px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
    }
    .input::placeholder {
      color: var(--text-secondary);
    }
    .input:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--focus-ring);
    }

    input[type="range"] {
      cursor: pointer;
      accent-color: var(--accent-primary);
    }

    /* === Buttons === */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      outline: none;
      border-radius: 8px;
      padding: 10px 16px;
      font-family: inherit;
      font-size: var(--font-size-base);
      font-weight: 500;
      cursor: pointer;
      transition: background-color 150ms var(--easing-out), transform 150ms var(--easing-out), box-shadow 160ms var(--easing-out), color 150ms var(--easing-out), border-color 150ms var(--easing-out);
      white-space: nowrap;
      gap: 8px;
    }
    .btn:disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    .btn--primary {
      background-color: var(--accent-primary);
      color: #fff;
      box-shadow: var(--shadow-sm);
    }
    .btn--primary:hover {
      background-color: var(--accent-primary-hover);
      transform: translateY(-1px);
      box-shadow: var(--btn-shadow);
    }
    .btn--primary:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .btn--secondary {
      background-color: var(--bg-card-secondary);
      border: 1px solid var(--divider);
      color: var(--text-main);
      box-shadow: var(--shadow-sm);
    }
    .btn--secondary:hover {
      background-color: #E8EBEF;
    }
    .btn--secondary:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .btn--ghost {
      background-color: transparent;
      color: var(--accent-primary);
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-weight: 500;
    }
    .btn--ghost:hover {
      text-decoration: none;
      background-color: rgba(59,130,246,0.08);
    }
    .btn--ghost:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    /* === Multiselect Dropdowns === */
    .multiselect {
      position: relative;
      min-width: 200px;
      max-width: 320px;
    }
    .multiselect-btn {
      width: 100%;
      text-align: left;
      background-color: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--divider-strong);
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: border-color var(--duration-normal) var(--easing-out), box-shadow var(--duration-normal) var(--easing-out), background-color var(--duration-normal) var(--easing-out);
      white-space: nowrap;
      overflow: hidden;
      font-size: var(--font-size-base);
      font-weight: 400;
      box-shadow: var(--shadow-sm);
    }
    .multiselect-btn:disabled {
      color: var(--text-muted);
      cursor: not-allowed;
      background-color: var(--bg-card-secondary);
    }
    .multiselect-btn:focus-visible, .multiselect.open .multiselect-btn {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--focus-ring);
    }
    .multiselect-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background-color: var(--bg-card);
      border: 1px solid var(--divider);
      border-radius: var(--radius-lg);
      max-height: 320px;
      overflow-y: auto;
      display: none;
      z-index: 100;
      box-shadow: var(--shadow-lg);
    }
    .multiselect.open .multiselect-dropdown {
      display: block;
      animation: dropdownOpen var(--duration-fast) var(--easing-out);
    }
    @keyframes dropdownOpen {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dropdown-search {
      padding: 8px;
      position: sticky;
      top: 0;
      background-color: var(--bg-card);
      z-index: 2;
      border-bottom: 1px solid var(--divider);
    }
    .dropdown-search .input {
      width: 100%;
      min-width: 0;
      padding: 8px 10px;
      font-size: 13px;
    }
    .store-header {
      padding: 8px 12px;
      font-weight: 600;
      color: var(--text-muted);
      border-bottom: 1px solid var(--divider);
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* === Checkboxes === */
    .checkbox-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      transition: background-color var(--duration-fast) var(--easing-out);
      color: var(--text-main);
      font-size: var(--font-size-base);
    }
    .checkbox-pill:hover {
      background-color: var(--bg-card-hover);
    }
    .checkbox-pill input,
    .checkbox-square {
      appearance: none;
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      min-width: 18px;
      border-radius: 6px;
      background-color: var(--bg-card);
      border: 2px solid var(--divider-strong);
      cursor: pointer;
      position: relative;
      transition: all 180ms ease;
      display: grid;
      place-content: center;
      margin: 0;
    }
    .checkbox-pill input:hover,
    .checkbox-square:hover {
      border-color: var(--accent-primary);
    }
    .checkbox-pill input::before,
    .checkbox-square::before {
      content: "";
      width: 10px;
      height: 10px;
      background-color: white;
      clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
      transform: scale(0);
      transition: transform 180ms var(--easing-out);
    }
    .checkbox-pill input:checked,
    .checkbox-square:checked {
      background-color: var(--accent-primary);
      border-color: var(--accent-primary);
    }
    .checkbox-pill input:checked::before,
    .checkbox-square:checked::before {
      transform: scale(1);
    }
    .checkbox-pill input:focus-visible,
    .checkbox-square:focus-visible {
      box-shadow: 0 0 0 3px var(--focus-ring);
    }
    .checkbox-pill input:disabled,
    .checkbox-square:disabled {
      background-color: var(--bg-card-secondary);
      border-color: var(--divider);
    }
    .checkbox-pill input:disabled::before,
    .checkbox-square:disabled::before {
      background-color: var(--text-muted);
    }

    /* === Table === */
    .table-wrap {
      flex: 1;
      padding: 20px 0 0;
      overflow-x: auto;
      background: var(--bg-card);
      border: 1px solid var(--divider);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      margin-top: 20px;
    }
    .table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 13px;
      margin: 0;
    }
    .table th, .table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--divider);
      vertical-align: middle;
    }
    .table th {
      background-color: var(--bg-page);
      color: #374151;
      font-weight: 500;
      position: sticky;
      top: 0;
      z-index: 10;
      cursor: pointer;
      user-select: none;
      transition: background-color var(--duration-fast);
      white-space: nowrap;
    }
    .table th:hover {
      background-color: var(--bg-card-secondary);
    }
    .table th:first-child {
      border-top-left-radius: var(--radius-md);
    }
    .table th:last-child {
      border-top-right-radius: var(--radius-md);
    }

    .sort-icon {
      width: 16px;
      height: 16px;
      margin-left: 6px;
      stroke: currentColor;
      opacity: 0.3;
      transition: opacity 0.2s, transform 0.2s;
      vertical-align: text-bottom;
      display: inline-block;
    }
    .table th.sorted .sort-icon {
      opacity: 1;
      color: var(--accent-primary);
    }
    .table th.sorted.asc .sort-icon {
      transform: rotate(180deg);
    }

    .table tbody tr {
      background-color: transparent;
      transition: background-color var(--duration-fast);
    }
    .table tbody tr:hover {
      background-color: var(--bg-card-hover);
    }
    .table tbody tr.selected {
      background-color: rgba(59,130,246,0.08);
      position: relative;
    }
    .table tbody tr.selected td:first-child::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: var(--accent-primary);
    }

    .table td.price {
      color: var(--accent-success);
      font-weight: 600;
      white-space: nowrap;
      text-align: right;
    }
    .table td.old-price {
      color: var(--text-muted);
      text-decoration: line-through;
      white-space: nowrap;
      text-align: right;
    }
    .table td.discount {
      font-weight: 600;
      white-space: nowrap;
      text-align: right;
    }
    .table td.discount.has {
      color: var(--accent-success);
    }
    .table th.col-right, .table td.col-right {
      text-align: right;
    }

    /* === Badges === */
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: var(--radius-pill);
      font-size: var(--font-size-sm);
      font-weight: 600;
      white-space: nowrap;
    }
    .badge--silpo {
      background-color: rgba(34,197,94,0.12);
      color: var(--accent-success);
    }
    .badge--novus {
      background-color: rgba(59,130,246,0.12);
      color: var(--accent-primary);
    }
    .badge--fora {
      background-color: rgba(245,158,11,0.14);
      color: #D97706;
    }

    /* === Status Bar === */
    .status-bar {
      padding: 14px 20px;
      background-color: var(--bg-card);
      color: var(--text-secondary);
      font-size: 13px;
      border: 1px solid var(--divider);
      border-radius: 16px;
      text-align: center;
      margin-top: 16px;
      box-shadow: var(--shadow-sm);
    }

    .loader {
      display: none;
      padding: 40px 24px 20px;
      text-align: center;
      color: var(--accent-primary);
      font-size: var(--font-size-md);
      font-weight: 500;
    }
    .loader.active {
      display: block;
    }

    /* === Responsive (Mobile Cards) === */
    @media (max-width: 992px) {
      body { padding: 16px; }
      .header { padding: 16px; top: 16px; }
      .table-wrap { padding-top: 16px; }
    }

    @media (max-width: 768px) {
      .header__controls { flex-direction: column; align-items: stretch; }
      .multiselect { max-width: 100%; }
      .header__search { margin-left: 0; width: 100%; }
      .header__search input { flex: 1; }
      .filters-panel { gap: 12px; }
      .filter-item input[type="range"] { width: 100px; }

      .table, .table tbody, .table tr, .table td {
        display: block;
        width: 100%; }
      .table thead {
        display: none;
      }
      .table tr {
        background-color: var(--bg-card);
        border: 1px solid var(--divider);
        border-radius: var(--radius-lg);
        margin-bottom: 12px;
        padding: 12px;
        box-shadow: var(--shadow-sm);
      }
      .table tr.selected {
        border-color: var(--accent-primary);
      }
      .table tr.selected td:first-child::before {
        display: none;
      }
      .table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider);
        text-align: left;
      }
      .table td:last-child {
        border-bottom: none;
      }
      .table td::before {
        content: attr(data-label);
        color: var(--text-secondary);
        font-weight: 500;
        margin-right: 16px;
      }
      .table td > :last-child {
        text-align: right;
      }

      .table td.product-name {
        flex-direction: column;
        align-items: flex-start;
      }
      .table td.product-name::before {
        margin-bottom: 4px;
      }
      .table td.col-right {
        text-align: left;
      }
      .table td.price, .table td.old-price, .table td.discount {
        text-align: right;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header__top">
      <h1>WebSales</h1>
      <div class="header__controls">
        <div class="multiselect">
          <button id="storeBtn" class="btn btn--secondary multiselect-btn">
            <span>-- Магазини --</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div id="storeDropdown" class="multiselect-dropdown">
            <label class="checkbox-pill">
              <input type="checkbox" value="silpo"><span>Сільпо</span>
            </label>
            <label class="checkbox-pill">
              <input type="checkbox" value="novus"><span>Новус</span>
            </label>
            <label class="checkbox-pill">
              <input type="checkbox" value="fora"><span>Фора</span>
            </label>
          </div>
        </div>
        
        <div class="multiselect">
          <button id="categoryBtn" class="btn btn--secondary multiselect-btn" disabled>
            <span>-- Категорії --</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div id="categoryDropdown" class="multiselect-dropdown">
            <div class="dropdown-search">
              <input type="text" id="categorySearch" class="input" placeholder="Пошук категорії..." />
            </div>
            <div id="categoryList">
              <!-- Р§РµРєР±РѕРєСЃС‹ РєР°С‚РµРіРѕСЂРёР№ Р±СѓРґСѓС‚ Р·РґРµСЃСЊ С‚РѕР¶Рµ checkbox-pill -->
            </div>
          </div>
        </div>

        <button id="btnFind" class="btn btn--primary" disabled>Знайти товари</button>
      </div>

      <div class="header__search">
        <input type="text" id="searchInput" class="input" placeholder="Пошук товару..." />
        <button id="btnSearch" class="btn btn--secondary">Пошук</button>
      </div>
    </div>

    <div class="filters-panel">
      <div class="filter-item">
        <label for="minPrice">Від: <span id="minPriceVal">0</span> ₴</label>
        <input type="range" id="minPrice" min="0" max="500" value="0" />
      </div>
      <div class="filter-item">
        <label for="maxPrice">До: <span id="maxPriceVal">500</span> ₴</label>
        <input type="range" id="maxPrice" min="0" max="500" value="500" />
      </div>
      <label class="filter-item" style="cursor: pointer; user-select: none;">
        <input type="checkbox" id="discountOnly" class="checkbox-square" />
        Тільки зі знижкою
      </label>
    </div>
  </div>

  <div class="loader" id="loader">Завантаження...</div>

  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th style="width: 48px;">
            <input type="checkbox" class="checkbox-square" id="selectAllCb" title="Обрати всі" />
          </th>
          <th data-key="store">Магазин <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></th>
          <th data-key="name">Назва продукту <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></th>
          <th data-key="category">Категорія <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></th>
          <th data-key="unit">Одиниця <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></th>
          <th data-key="price" class="col-right">Ціна <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></th>
          <th data-key="oldPrice" class="col-right">Стара ціна <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></th>
          <th data-key="discount" class="col-right">Знижка <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></th>
          <th>Дія</th>
        </tr>
      </thead>
      <tbody id="tableBody"></tbody>
    </table>
  </div>

  <div class="status-bar" id="statusBar">Оберіть магазин та категорію.</div>

  <script>
    const storeBtn = document.getElementById('storeBtn');
    const storeDropdown = document.getElementById('storeDropdown');
    const categoryBtn = document.getElementById('categoryBtn');
    const categoryDropdown = document.getElementById('categoryDropdown');
    const categorySearch = document.getElementById('categorySearch');
    const categoryList = document.getElementById('categoryList');
    const btnFind = document.getElementById('btnFind');
    const searchInput = document.getElementById('searchInput');
    const btnSearch = document.getElementById('btnSearch');
    const minPriceInput = document.getElementById('minPrice');
    const minPriceVal = document.getElementById('minPriceVal');
    const maxPriceInput = document.getElementById('maxPrice');
    const maxPriceVal = document.getElementById('maxPriceVal');
    const discountOnlyCb = document.getElementById('discountOnly');
    const tableBody = document.getElementById('tableBody');
    const statusBar = document.getElementById('statusBar');
    const loader = document.getElementById('loader');

    let allProducts = [];
    let displayProducts = [];
    let currentSort = { key: null, dir: 1 }; // 1 = asc, -1 = desc

    // вЂ”вЂ”вЂ” Р›РѕРіРёРєР° РјСѓР»СЊС‚РёРІС‹Р±РѕСЂР° РјР°РіР°Р·РёРЅРѕРІ Рё РєР°С‚РµРіРѕСЂРёР№ вЂ”вЂ”вЂ”
    storeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!storeBtn.disabled) document.getElementById('storeBtn').closest('.multiselect').classList.toggle('open');
    });

    categoryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!categoryBtn.disabled) document.getElementById('categoryBtn').closest('.multiselect').classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!storeBtn.contains(e.target) && !storeDropdown.contains(e.target)) {
        storeBtn.closest('.multiselect').classList.remove('open');
      }
      if (!categoryBtn.contains(e.target) && !categoryDropdown.contains(e.target)) {
        categoryBtn.closest('.multiselect').classList.remove('open');
      }
    });

    categorySearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      let currentHeader = null;
      let headerHasVisibleCats = false;

      Array.from(categoryList.children).forEach(el => {
        if (el.classList.contains('store-header')) {
          if (currentHeader) currentHeader.style.display = headerHasVisibleCats ? 'block' : 'none';
          currentHeader = el;
          headerHasVisibleCats = false;
        } else if (el.classList.contains('checkbox-pill')) {
          const text = el.querySelector('span').textContent.toLowerCase();
          if (text.includes(q)) {
            el.style.display = 'flex';
            headerHasVisibleCats = true;
          } else {
            el.style.display = 'none';
          }
        }
      });
      if (currentHeader) currentHeader.style.display = headerHasVisibleCats ? 'block' : 'none';
    });
    
    categorySearch.addEventListener('click', (e) => e.stopPropagation());

    function updateStoreButtonText() {
      const checkedBoxes = Array.from(storeDropdown.querySelectorAll('input[type="checkbox"]:checked'));
      const btnText = storeBtn.querySelector('span:first-child');
      
      if (checkedBoxes.length === 0) {
        btnText.textContent = '-- \u041c\u0430\u0433\u0430\u0437\u0438\u043d\u0438 --';
        loadCategoriesForStores([]);
      } else if (checkedBoxes.length === 1) {
        btnText.textContent = checkedBoxes[0].nextElementSibling.textContent;
        loadCategoriesForStores(checkedBoxes.map(cb => cb.value));
      } else {
        btnText.textContent = '\u041e\u0431\u0440\u0430\u043d\u043e: ' + checkedBoxes.length;
        loadCategoriesForStores(checkedBoxes.map(cb => cb.value));
      }
    }
    
    storeDropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', updateStoreButtonText);
    });

    function getSelectedStores() {
      return Array.from(storeDropdown.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    }

    function updateCategoryButtonText() {
      const checkedBoxes = Array.from(categoryDropdown.querySelectorAll('input[type="checkbox"]:checked'));
      const btnText = categoryBtn.querySelector('span:first-child');
      
      if (checkedBoxes.length === 0) {
        btnText.textContent = '-- \u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u0457 --';
        btnFind.disabled = true;
      } else if (checkedBoxes.length === 1) {
        btnText.textContent = checkedBoxes[0].nextElementSibling.textContent;
        btnFind.disabled = false;
      } else {
        btnText.textContent = '\u041e\u0431\u0440\u0430\u043d\u043e: ' + checkedBoxes.length;
        btnFind.disabled = false;
      }
    }

    function getSelectedCategories() {
      const checkedBoxes = Array.from(categoryDropdown.querySelectorAll('input[type="checkbox"]:checked'));
      return checkedBoxes.map(cb => cb.value);
    }

    let currentCategoryFetchId = 0;

    // вЂ”вЂ”вЂ” РЎРѕСЂС‚РёСЂРѕРІРєР° РїРѕ СЃС‚РѕР»Р±С†Р°Рј вЂ”вЂ”вЂ”
    document.querySelectorAll('.table thead th[data-key]').forEach(th => {
      th.addEventListener('click', () => {
        if (th.dataset.key === 'checked') return;
        
        const key = th.dataset.key;
        if (currentSort.key === key) {
          currentSort.dir *= -1;
        } else {
          currentSort.key = key;
          currentSort.dir = key === 'discount' ? -1 : 1;
        }
        
        document.querySelectorAll('.table thead th').forEach(t => t.classList.remove('sorted', 'asc', 'desc'));
        th.classList.add('sorted');
        th.classList.add(currentSort.dir === 1 ? 'asc' : 'desc');

        sortAndRender();
      });
    });

    function sortAndRender() {
      const key = currentSort.key;
      const dir = currentSort.dir;
      if (!key) { renderProducts(displayProducts); return; }

      displayProducts.sort((a, b) => {
        let va = a[key];
        let vb = b[key];
        
        if (key === 'discount') {
          va = va != null ? Math.abs(va) : null;
          vb = vb != null ? Math.abs(vb) : null;
        }

        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        
        if (typeof va === 'number' && typeof vb === 'number') {
          return (va - vb) * dir;
        }
        return String(va).localeCompare(String(vb), 'uk') * dir;
      });
      renderProducts(displayProducts);
    }

    // вЂ”вЂ”вЂ” Р—Р°РіСЂСѓР·РєР° РєР°С‚РµРіРѕСЂРёР№ вЂ”вЂ”вЂ”
    async function loadCategoriesForStores(stores) {
      const fetchId = ++currentCategoryFetchId;
      categoryList.innerHTML = '';
      categorySearch.value = '';
      categoryBtn.querySelector('span:first-child').textContent = '-- \u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u0457 --';
      categoryBtn.disabled = true;
      btnFind.disabled = true;
      allProducts = [];
      displayProducts = [];
      tableBody.innerHTML = '';
      
      if (!stores || stores.length === 0) {
        statusBar.textContent = '\u041e\u0431\u0435\u0440\u0456\u0442\u044c \u043c\u0430\u0433\u0430\u0437\u0438\u043d(\u0438) \u0442\u0430 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u044e(\u0457).';
        return;
      }

      loader.classList.add('active');
      statusBar.textContent = '\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043d\u044f \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u0439...';

      try {
        let totalCategories = 0;
        
        for (const store of stores) {
          const resp = await fetch('/api/' + store + '/categories');
          const data = await resp.json();
          
          if (fetchId !== currentCategoryFetchId) return;

          let categories = Array.isArray(data) ? data : [];
          
          if (categories.length > 0) {
            const storeNameMap = { 'silpo': '\u0421\u0456\u043b\u044c\u043f\u043e', 'novus': '\u041d\u043e\u0432\u0443\u0441', 'fora': '\u0424\u043e\u0440\u0430' };
            const storeHeader = document.createElement('div');
            storeHeader.className = 'store-header';
            storeHeader.textContent = storeNameMap[store] || store;
            categoryList.appendChild(storeHeader);
          }

          categories.forEach(c => {
            if (c.count === 0) return;
            totalCategories++;
            const label = document.createElement('label');
            label.className = 'checkbox-pill';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = store + ':' + c.id;
            checkbox.addEventListener('change', updateCategoryButtonText);
            
            const textSpan = document.createElement('span');
            textSpan.textContent = c.title + (c.count ? ' (' + c.count + ')' : '');

            label.appendChild(checkbox);
            label.appendChild(textSpan);
            categoryList.appendChild(label);
          });
        }

        categoryBtn.disabled = false;
        statusBar.textContent = '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u0457 \u0437\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u0456 (' + totalCategories + '). \u041e\u0431\u0435\u0440\u0456\u0442\u044c \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u044e.';
      } catch (err) {
        statusBar.textContent = '\u041f\u043e\u043c\u0438\u043b\u043a\u0430: ' + err.message;
      }
      loader.classList.remove('active');
    }

    // вЂ”вЂ”вЂ” Р—Р°РіСЂСѓР·РєР° С‚РѕРІР°СЂС–РІ вЂ”вЂ”вЂ”
    btnFind.addEventListener('click', loadProducts);

    async function loadProducts() {
      const stores = getSelectedStores();
      const categoriesParam = getSelectedCategories();
      if (stores.length === 0 || categoriesParam.length === 0) return;

      loader.classList.add('active');
      btnFind.disabled = true;
      storeBtn.disabled = true;
      categoryBtn.disabled = true;
      storeBtn.closest('.multiselect').classList.remove('open');
      categoryBtn.closest('.multiselect').classList.remove('open');
      statusBar.textContent = '\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043d\u044f \u0442\u043e\u0432\u0430\u0440\u0456\u0432...';
      tableBody.innerHTML = '';
      allProducts = [];
      displayProducts = [];

      try {
        let totalCount = 0;
        
        const fetchPromises = stores.map(async store => {
          const storeCats = categoriesParam
            .filter(val => val.startsWith(store + ':'))
            .map(val => val.split(':')[1])
            .join(',');
            
          if (!storeCats) return null;

          let url = '/api/' + store + '/products?category=' + encodeURIComponent(storeCats);
          const resp = await fetch(url);
          const data = await resp.json();
          return data;
        });
        
        const results = await Promise.all(fetchPromises);
        
        for (const data of results) {
          if (!data) continue;
          if (data.error) {
            console.error('API Error:', data.error);
            continue;
          }
          allProducts = allProducts.concat(data.products || []);
          totalCount += (data.total || (data.products ? data.products.length : 0));
        }

        displayProducts = [...allProducts];

        currentSort = { key: 'discount', dir: -1 };
        document.querySelectorAll('.table thead th').forEach(t => t.classList.remove('sorted', 'asc', 'desc'));
        const discTh = document.querySelector('.table thead th[data-key="discount"]');
        if (discTh) { discTh.classList.add('sorted', 'desc'); }

        doSearch();
        statusBar.textContent = '\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043e ' + allProducts.length + ' \u0442\u043e\u0432\u0430\u0440\u0456\u0432.';
      } catch (err) {
        statusBar.textContent = '\u041f\u043e\u043c\u0438\u043b\u043a\u0430: ' + err.message;
      }

      loader.classList.remove('active');
      btnFind.disabled = false;
      storeBtn.disabled = false;
      categoryBtn.disabled = false;
    }

    // вЂ”вЂ”вЂ” РџРѕС€СѓРє С‚Р° С„С–Р»СЊС‚СЂРё вЂ”вЂ”вЂ”
    btnSearch.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    minPriceInput.addEventListener('input', () => { minPriceVal.textContent = minPriceInput.value; doSearch(); });
    maxPriceInput.addEventListener('input', () => { maxPriceVal.textContent = maxPriceInput.value; doSearch(); });
    discountOnlyCb.addEventListener('change', doSearch);

    function doSearch() {
      const q = searchInput.value.trim().toLowerCase();
      const minP = parseFloat(minPriceInput.value) || 0;
      const maxP = parseFloat(maxPriceInput.value) || 500;
      const discountOnly = discountOnlyCb.checked;

      displayProducts = allProducts.filter(p => {
        const textMatch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        const price = p.price || 0;
        const priceMatch = price >= minP && (maxP >= 500 ? true : price <= maxP);
        const discountMatch = !discountOnly || (p.discount != null && p.discount !== 0);

        return textMatch && priceMatch && discountMatch;
      });
      
      sortAndRender();
      if (q || minP > 0 || maxP < 500 || discountOnly) {
        statusBar.textContent = '\u0417\u043d\u0430\u0439\u0434\u0435\u043d\u043e ' + displayProducts.length + ' \u0437 ' + allProducts.length + ' \u0442\u043e\u0432\u0430\u0440\u0456\u0432 (\u0437\u0430\u0441\u0442\u043e\u0441\u043e\u0432\u0430\u043d\u043e \u0444\u0456\u043b\u044c\u0442\u0440).';
      } else {
        statusBar.textContent = '\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043e ' + allProducts.length + ' \u0442\u043e\u0432\u0430\u0440\u0456\u0432.';
      }
    }

    // вЂ”вЂ”вЂ” Р РµРЅРґРµСЂ С‚Р°Р±Р»РёС†С– вЂ”вЂ”вЂ”
    function renderProducts(products) {
      tableBody.innerHTML = '';
      for (const p of products) {
        const tr = document.createElement('tr');
        const storeClass = p.store === '\u0421\u0456\u043b\u044c\u043f\u043e' ? 'silpo' : p.store === '\u0424\u043e\u0440\u0430' ? 'fora' : 'novus';
        const discountDisplay = p.discount != null ? Math.abs(p.discount) + '%' : '\u2014';

        tr.innerHTML =
          '<td data-label="\u0412\u0438\u0431\u0456\u0440"><input type="checkbox" class="checkbox-square row-checkbox" /></td>' +
          '<td data-label="\u041c\u0430\u0433\u0430\u0437\u0438\u043d"><span class="badge badge--' + storeClass + '">' + esc(p.store) + '</span></td>' +
          '<td data-label="\u041d\u0430\u0437\u0432\u0430" class="product-name">' + esc(p.name) + '</td>' +
          '<td data-label="\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u044f">' + esc(p.category) + '</td>' +
          '<td data-label="\u041e\u0434\u0438\u043d\u0438\u0446\u044f">' + esc(p.unit) + '</td>' +
          '<td data-label="\u0426\u0456\u043d\u0430" class="price">' + formatPrice(p.price) + '</td>' +
          '<td data-label="\u0421\u0442\u0430\u0440\u0430 \u0446\u0456\u043d\u0430" class="old-price col-right">' + (p.oldPrice ? formatPrice(p.oldPrice) : '\u2014') + '</td>' +
          '<td data-label="\u0417\u043d\u0438\u0436\u043a\u0430" class="discount' + (p.discount != null ? ' has' : '') + ' col-right">' + discountDisplay + '</td>' +
          '<td data-label="\u0414\u0456\u044f"><a class="btn btn--ghost" href="' + esc(p.url) + '" target="_blank" rel="noopener">\u0412\u0456\u0434\u043a\u0440\u0438\u0442\u0438</a></td>';
        tableBody.appendChild(tr);
      }
    }

    // вЂ”вЂ”вЂ” Р›РѕРіС–РєР° РІРёР±РѕСЂСѓ СЂСЏРґРєС–РІ вЂ”вЂ”вЂ”
    tableBody.addEventListener('change', (e) => {
      if (e.target.classList.contains('row-checkbox')) {
        const tr = e.target.closest('tr');
        if (e.target.checked) tr.classList.add('selected');
        else tr.classList.remove('selected');
      }
    });

    const selectAllCb = document.getElementById('selectAllCb');
    selectAllCb.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      const checkboxes = tableBody.querySelectorAll('.row-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = isChecked;
        const tr = cb.closest('tr');
        if (isChecked) tr.classList.add('selected');
        else tr.classList.remove('selected');
      });
    });

    function formatPrice(v) {
      if (v == null) return '\u2014';
      return parseFloat(v).toFixed(2) + ' \u20b4';
    }

    function esc(str) {
      if (!str) return '';
      return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
  </script>
</body>
</html>`;


