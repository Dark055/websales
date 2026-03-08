var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-D9dgo2/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-D9dgo2/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// src/silpo.js
var SILPO_API = "https://api.catalog.ecom.silpo.ua/api/2.0/exec/EcomCatalogGlobal";
async function getSilpoCategories() {
  const body = {
    method: "GetCategories",
    data: {
      deliveryType: "DeliveryHome",
      filialId: 2028
    }
  };
  const resp = await fetch(SILPO_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "User-Agent": "Mozilla/5.0",
      "Origin": "https://silpo.ua",
      "Referer": "https://silpo.ua/"
    },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    throw new Error(`Silpo categories API error: ${resp.status}`);
  }
  const data = await resp.json();
  const allCats = data.tree || [];
  const roots = allCats.filter((c) => c.parentId === null || c.parentId === 0);
  const children = allCats.filter((c) => c.parentId !== null && c.parentId !== 0);
  const result = [];
  for (const root of roots.sort((a, b) => a.order - b.order)) {
    if (root.itemsCount === 0)
      continue;
    result.push({
      id: root.id,
      slug: root.slug,
      title: root.name,
      count: root.itemsCount
    });
    const kids = children.filter((c) => c.parentId === root.id).sort((a, b) => a.order - b.order);
    for (const kid of kids) {
      if (kid.itemsCount === 0)
        continue;
      result.push({
        id: kid.id,
        slug: kid.slug,
        title: `  \u2514 ${kid.name}`,
        count: kid.itemsCount
      });
    }
  }
  return result;
}
__name(getSilpoCategories, "getSilpoCategories");
async function getSilpoProducts(categoryId, offset = 0, limit = 100) {
  const body = {
    method: "GetSimpleCatalogItems",
    data: {
      deliveryType: "DeliveryHome",
      filialId: 2028,
      From: offset + 1,
      To: offset + limit,
      RankedResultsOnly: false
    }
  };
  let categoryName = "";
  if (categoryId) {
    body.data.categoryId = parseInt(categoryId) || 0;
    try {
      const catsResp = await fetch(SILPO_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "User-Agent": "Mozilla/5.0",
          "Origin": "https://silpo.ua",
          "Referer": "https://silpo.ua/"
        },
        body: JSON.stringify({ method: "GetCategories", data: { deliveryType: "DeliveryHome", filialId: 2028 } })
      });
      const catsData = await catsResp.json();
      const allCats = catsData.tree || [];
      const cat = allCats.find((c) => c.id === body.data.categoryId);
      if (cat)
        categoryName = cat.name;
    } catch (e) {
    }
  }
  const resp = await fetch(SILPO_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "User-Agent": "Mozilla/5.0",
      "Origin": "https://silpo.ua",
      "Referer": "https://silpo.ua/"
    },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Silpo API error: ${resp.status} \u2014 ${text.substring(0, 200)}`);
  }
  const data = await resp.json();
  const items = data.items || [];
  return {
    total: data.itemsCount || items.length,
    products: items.map(normalizeProduct)
  };
}
__name(getSilpoProducts, "getSilpoProducts");
function normalizeProduct(item) {
  const price = item.price || 0;
  const oldPrice = item.oldPrice || null;
  let discount = null;
  if (oldPrice && oldPrice > price) {
    discount = -Math.round((oldPrice - price) / oldPrice * 100);
  }
  return {
    store: "\u0421\u0456\u043B\u044C\u043F\u043E",
    name: item.name || item.title || "\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0438",
    category: "",
    price,
    oldPrice,
    discount,
    url: item.slug ? `https://silpo.ua/product/${item.slug}` : "#",
    image: item.mainImage || null
  };
}
__name(normalizeProduct, "normalizeProduct");

// src/novus.js
var ZAKAZ_BASE = "https://stores-api.zakaz.ua";
var DEFAULT_STORE_ID = "482010105";
async function getNovusCategories(storeId = DEFAULT_STORE_ID) {
  const resp = await fetch(`${ZAKAZ_BASE}/stores/${storeId}/categories/`, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "uk"
    }
  });
  if (!resp.ok) {
    throw new Error(`Novus categories API error: ${resp.status}`);
  }
  const data = await resp.json();
  const categories = [];
  for (const cat of data) {
    categories.push({
      id: cat.id,
      title: cat.title.trim(),
      count: cat.count,
      parentId: cat.parent_id
    });
    if (cat.children) {
      for (const child of cat.children) {
        categories.push({
          id: child.id,
          title: `  \u2514 ${child.title.trim()}`,
          count: child.count,
          parentId: child.parent_id
        });
      }
    }
  }
  return categories;
}
__name(getNovusCategories, "getNovusCategories");
async function getNovusProducts(categorySlug, storeId = DEFAULT_STORE_ID) {
  const products = [];
  let page = 1;
  let hasMore = true;
  while (hasMore && page <= 5) {
    const resp = await fetch(
      `${ZAKAZ_BASE}/stores/${storeId}/categories/${categorySlug}/products/?page=${page}`,
      { headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0", "Accept-Language": "uk" } }
    );
    if (!resp.ok)
      break;
    const data = await resp.json();
    const results = data.results || data;
    if (!Array.isArray(results) || results.length === 0) {
      hasMore = false;
      break;
    }
    for (const item of results) {
      products.push(normalizeNovusProduct(item, categorySlug));
    }
    if (data.next) {
      page++;
    } else {
      hasMore = false;
    }
  }
  return {
    total: products.length,
    products
  };
}
__name(getNovusProducts, "getNovusProducts");
function normalizeNovusProduct(item, categorySlug) {
  const price = item.price ? item.price / 100 : 0;
  const oldPrice = item.old_price ? item.old_price / 100 : null;
  let discount = null;
  if (oldPrice && oldPrice > price) {
    discount = Math.round((oldPrice - price) / oldPrice * 100);
  } else if (item.discount && item.discount.value) {
    discount = item.discount.value;
  }
  const ean = item.ean || item.id || "";
  const name = item.title || item.name || "\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0438";
  return {
    store: "\u041D\u043E\u0432\u0443\u0441",
    name,
    category: categorySlug || "",
    price,
    oldPrice,
    discount,
    url: `https://novus.zakaz.ua/uk/search/?q=${encodeURIComponent(name)}`,
    image: item.img ? item.img.s150x150 || item.img.s350x350 || null : null
  };
}
__name(normalizeNovusProduct, "normalizeNovusProduct");

// src/page.js
var HTML_PAGE = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebSales \u2014 \u041F\u0430\u0440\u0441\u0435\u0440 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0456\u0432</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a2e;
      color: #e0e0e0;
      min-height: 100vh;
    }
    .header {
      background: linear-gradient(135deg, #16213e, #0f3460);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      border-bottom: 2px solid #e94560;
      box-shadow: 0 2px 15px rgba(233,69,96,0.15);
    }
    .header h1 {
      font-size: 18px;
      color: #e94560;
      margin-right: 12px;
      white-space: nowrap;
    }
    select, input, button {
      padding: 8px 12px;
      border: 1px solid #333;
      border-radius: 6px;
      font-size: 14px;
      background: #16213e;
      color: #e0e0e0;
      outline: none;
      transition: border-color 0.2s;
    }
    select:focus, input:focus { border-color: #e94560; }
    select { min-width: 180px; max-width: 320px; }
    input { min-width: 160px; }
    button {
      background: #e94560;
      color: white;
      border: none;
      cursor: pointer;
      font-weight: 600;
      white-space: nowrap;
    }
    button:hover { background: #c73652; }
    button:disabled { background: #555; cursor: not-allowed; }
    .controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .search-group { display: flex; align-items: center; gap: 6px; margin-left: auto; }

    .table-wrap {
      overflow-x: auto;
      padding: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    thead th {
      background: #16213e;
      color: #e94560;
      padding: 10px 8px;
      text-align: left;
      position: sticky;
      top: 0;
      white-space: nowrap;
      border-bottom: 2px solid #e94560;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;
    }
    thead th:hover { background: #1a2a4e; }
    thead th .sort-arrow {
      display: inline-block;
      margin-left: 4px;
      font-size: 10px;
      opacity: 0.4;
    }
    thead th.sorted .sort-arrow { opacity: 1; }
    tbody tr { border-bottom: 1px solid #2a2a4a; }
    tbody tr:hover { background: rgba(233,69,96,0.07); }
    td { padding: 8px; vertical-align: middle; }
    .price { font-weight: 700; color: #4ecca3; white-space: nowrap; }
    .old-price { color: #888; text-decoration: line-through; white-space: nowrap; }
    .discount {
      font-weight: 700;
      white-space: nowrap;
    }
    .discount.has { color: #4ecca3; }
    .btn-link {
      display: inline-block;
      padding: 4px 10px;
      background: #0f3460;
      color: #4ecca3;
      text-decoration: none;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
    }
    .btn-link:hover { background: #1a4a7a; }
    .status-bar {
      padding: 8px 24px;
      background: #16213e;
      color: #888;
      font-size: 13px;
      border-top: 1px solid #2a2a4a;
    }
    .loader {
      display: none;
      padding: 40px;
      text-align: center;
      color: #e94560;
      font-size: 16px;
    }
    .loader.active { display: block; }
    .store-tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    .store-tag.silpo { background: #2d6a4f; color: #b7e4c7; }
    .store-tag.novus { background: #1d3557; color: #a8dadc; }
  </style>
</head>
<body>
  <div class="header">
    <h1>\u{1F6D2} WebSales</h1>
    <div class="controls">
      <select id="store">
        <option value="">-- \u041C\u0430\u0433\u0430\u0437\u0438\u043D --</option>
        <option value="silpo">\u0421\u0456\u043B\u044C\u043F\u043E</option>
        <option value="novus">\u041D\u043E\u0432\u0443\u0441</option>
      </select>
      <select id="category" disabled>
        <option value="">-- \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F --</option>
      </select>
      <button id="btnFind" disabled>\u0417\u043D\u0430\u0439\u0442\u0438 \u0442\u043E\u0432\u0430\u0440\u0438</button>
    </div>
    <div class="search-group">
      <input type="text" id="searchInput" placeholder="\u041F\u043E\u0448\u0443\u043A \u0442\u043E\u0432\u0430\u0440\u0443..." />
      <button id="btnSearch">\u041F\u043E\u0448\u0443\u043A</button>
    </div>
  </div>

  <div class="loader" id="loader">\u23F3 \u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F...</div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th data-key="store">\u041C\u0430\u0433\u0430\u0437\u0438\u043D <span class="sort-arrow">\u25B2\u25BC</span></th>
          <th data-key="name">\u041D\u0430\u0437\u0432\u0430 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0443 <span class="sort-arrow">\u25B2\u25BC</span></th>
          <th data-key="category">\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F <span class="sort-arrow">\u25B2\u25BC</span></th>
          <th data-key="price">\u041F\u043E\u0442\u043E\u0447\u043D\u0430 \u0446\u0456\u043D\u0430 <span class="sort-arrow">\u25B2\u25BC</span></th>
          <th data-key="oldPrice">\u0421\u0442\u0430\u0440\u0430 \u0446\u0456\u043D\u0430 <span class="sort-arrow">\u25B2\u25BC</span></th>
          <th data-key="discount">\u0417\u043D\u0438\u0436\u043A\u0430 % <span class="sort-arrow">\u25B2\u25BC</span></th>
          <th>\u041F\u043E\u0441\u0438\u043B\u0430\u043D\u043D\u044F</th>
        </tr>
      </thead>
      <tbody id="tableBody"></tbody>
    </table>
  </div>

  <div class="status-bar" id="statusBar">\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u043C\u0430\u0433\u0430\u0437\u0438\u043D \u0442\u0430 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044E.</div>

  <script>
    const storeSelect = document.getElementById('store');
    const catSelect = document.getElementById('category');
    const btnFind = document.getElementById('btnFind');
    const searchInput = document.getElementById('searchInput');
    const btnSearch = document.getElementById('btnSearch');
    const tableBody = document.getElementById('tableBody');
    const statusBar = document.getElementById('statusBar');
    const loader = document.getElementById('loader');

    let allProducts = [];
    let displayProducts = [];
    let currentSort = { key: null, dir: 1 }; // 1 = asc, -1 = desc

    // \u2014\u2014\u2014 \u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043E \u0441\u0442\u043E\u043B\u0431\u0446\u0430\u043C \u2014\u2014\u2014
    document.querySelectorAll('thead th[data-key]').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.key;
        if (currentSort.key === key) {
          currentSort.dir *= -1;
        } else {
          currentSort.key = key;
          currentSort.dir = key === 'discount' ? 1 : 1; // \u043F\u043E-\u0443\u043C\u043E\u043B\u0447 asc
        }
        // \u0423\u0431\u0438\u0440\u0430\u0435\u043C \u043A\u043B\u0430\u0441\u0441 sorted \u0443 \u0432\u0441\u0435\u0445
        document.querySelectorAll('thead th').forEach(t => t.classList.remove('sorted'));
        th.classList.add('sorted');
        th.querySelector('.sort-arrow').textContent = currentSort.dir === 1 ? '\u25B2' : '\u25BC';

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
        // null / undefined \u0432 \u043A\u043E\u043D\u0435\u0446
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        // \u0447\u0438\u0441\u043B\u0430
        if (typeof va === 'number' && typeof vb === 'number') {
          return (va - vb) * dir;
        }
        // \u0441\u0442\u0440\u043E\u043A\u0438
        return String(va).localeCompare(String(vb), 'uk') * dir;
      });
      renderProducts(displayProducts);
    }

    // \u2014\u2014\u2014 \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 \u2014\u2014\u2014
    storeSelect.addEventListener('change', async () => {
      const store = storeSelect.value;
      catSelect.innerHTML = '<option value="">-- \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F --</option>';
      catSelect.disabled = true;
      btnFind.disabled = true;
      allProducts = [];
      displayProducts = [];
      tableBody.innerHTML = '';
      statusBar.textContent = '\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u043C\u0430\u0433\u0430\u0437\u0438\u043D \u0442\u0430 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044E.';

      if (!store) return;

      loader.classList.add('active');
      statusBar.textContent = '\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u0439...';

      try {
        const resp = await fetch('/api/' + store + '/categories');
        const data = await resp.json();

        let categories = Array.isArray(data) ? data : [];
        categories.forEach(c => {
          if (c.count === 0) return;
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = c.title + (c.count ? ' (' + c.count + ')' : '');
          catSelect.appendChild(opt);
        });

        catSelect.disabled = false;
        btnFind.disabled = false;
        statusBar.textContent = '\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u0457 \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u0456 (' + categories.filter(c => c.count > 0).length + '). \u041E\u0431\u0435\u0440\u0456\u0442\u044C \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044E.';
      } catch (err) {
        statusBar.textContent = '\u041F\u043E\u043C\u0438\u043B\u043A\u0430: ' + err.message;
      }
      loader.classList.remove('active');
    });

    // \u2014\u2014\u2014 \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0442\u043E\u0432\u0430\u0440\u0456\u0432 \u2014\u2014\u2014
    btnFind.addEventListener('click', loadProducts);

    async function loadProducts() {
      const store = storeSelect.value;
      const category = catSelect.value;
      if (!store) return;

      loader.classList.add('active');
      btnFind.disabled = true;
      statusBar.textContent = '\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F \u0442\u043E\u0432\u0430\u0440\u0456\u0432...';
      tableBody.innerHTML = '';
      allProducts = [];
      displayProducts = [];

      try {
        let url = '/api/' + store + '/products?category=' + encodeURIComponent(category);
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.error) {
          statusBar.textContent = '\u041F\u043E\u043C\u0438\u043B\u043A\u0430: ' + data.error;
          loader.classList.remove('active');
          btnFind.disabled = false;
          return;
        }

        allProducts = data.products || [];
        displayProducts = [...allProducts];

        // \u041F\u043E-\u0443\u043C\u043E\u043B\u0447 \u0441\u043E\u0440\u0442\u0438\u0440\u0443\u0435\u043C \u043F\u043E \u0441\u043A\u0438\u0434\u043A\u0435 (\u0441\u0430\u043C\u0430\u044F \u0431\u043E\u043B\u044C\u0448\u0430\u044F \u0441\u043A\u0438\u0434\u043A\u0430 \u043F\u0435\u0440\u0432\u0430\u044F)
        currentSort = { key: 'discount', dir: 1 };
        document.querySelectorAll('thead th').forEach(t => t.classList.remove('sorted'));
        const discTh = document.querySelector('thead th[data-key="discount"]');
        if (discTh) { discTh.classList.add('sorted'); discTh.querySelector('.sort-arrow').textContent = '\u25B2'; }

        sortAndRender();
        statusBar.textContent = '\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043E ' + allProducts.length + ' \u0442\u043E\u0432\u0430\u0440\u0456\u0432' + (data.total ? ' \u0437 ' + data.total : '') + '.';
      } catch (err) {
        statusBar.textContent = '\u041F\u043E\u043C\u0438\u043B\u043A\u0430: ' + err.message;
      }

      loader.classList.remove('active');
      btnFind.disabled = false;
    }

    // \u2014\u2014\u2014 \u041F\u043E\u0448\u0443\u043A \u2014\u2014\u2014
    btnSearch.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

    function doSearch() {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        displayProducts = [...allProducts];
      } else {
        displayProducts = allProducts.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      sortAndRender();
      if (q) {
        statusBar.textContent = '\u0417\u043D\u0430\u0439\u0434\u0435\u043D\u043E ' + displayProducts.length + ' \u0437 ' + allProducts.length + ' \u0442\u043E\u0432\u0430\u0440\u0456\u0432.';
      } else {
        statusBar.textContent = '\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043E ' + allProducts.length + ' \u0442\u043E\u0432\u0430\u0440\u0456\u0432.';
      }
    }

    // \u2014\u2014\u2014 \u0420\u0435\u043D\u0434\u0435\u0440 \u0442\u0430\u0431\u043B\u0438\u0446\u0456 \u2014\u2014\u2014
    function renderProducts(products) {
      tableBody.innerHTML = '';
      for (const p of products) {
        const tr = document.createElement('tr');
        const storeClass = p.store === '\u0421\u0456\u043B\u044C\u043F\u043E' ? 'silpo' : 'novus';

        tr.innerHTML =
          '<td><span class="store-tag ' + storeClass + '">' + esc(p.store) + '</span></td>' +
          '<td>' + esc(p.name) + '</td>' +
          '<td>' + esc(p.category) + '</td>' +
          '<td class="price">' + formatPrice(p.price) + '</td>' +
          '<td class="old-price">' + (p.oldPrice ? formatPrice(p.oldPrice) : '\u2014') + '</td>' +
          '<td class="discount' + (p.discount != null ? ' has' : '') + '">' + (p.discount != null ? p.discount + '%' : '\u2014') + '</td>' +
          '<td><a class="btn-link" href="' + esc(p.url) + '" target="_blank" rel="noopener">\u0412\u0456\u0434\u043A\u0440\u0438\u0442\u0438</a></td>';
        tableBody.appendChild(tr);
      }
    }

    function formatPrice(v) {
      if (v == null) return '\u2014';
      return parseFloat(v).toFixed(2) + ' \u20B4';
    }

    function esc(str) {
      if (!str) return '';
      return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
  <\/script>
</body>
</html>`;

// src/index.js
var src_default = {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      if (path === "/api/silpo/categories") {
        const data = await getSilpoCategories();
        return json(data, corsHeaders);
      }
      if (path === "/api/silpo/products") {
        const category = url.searchParams.get("category") || "";
        const offset = parseInt(url.searchParams.get("offset") || "0");
        const limit = parseInt(url.searchParams.get("limit") || "100");
        const data = await getSilpoProducts(category, offset, limit);
        return json(data, corsHeaders);
      }
      if (path === "/api/novus/categories") {
        const data = await getNovusCategories();
        return json(data, corsHeaders);
      }
      if (path === "/api/novus/products") {
        const category = url.searchParams.get("category") || "";
        const data = await getNovusProducts(category);
        return json(data, corsHeaders);
      }
      if (path === "/" || path === "/index.html") {
        return new Response(HTML_PAGE, {
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }
      return new Response("Not Found", { status: 404 });
    } catch (err) {
      return json({ error: err.message }, corsHeaders, 500);
    }
  }
};
function json(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders
    }
  });
}
__name(json, "json");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-D9dgo2/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-D9dgo2/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
