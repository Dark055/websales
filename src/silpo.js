import { findCategoryById, flattenParentCategories } from './catalog-utils.js';

const SILPO_API = 'https://api.catalog.ecom.silpo.ua/api/2.0/exec/EcomCatalogGlobal';
const SILPO_HEADERS = {
  'Content-Type': 'application/json;charset=UTF-8',
  'User-Agent': 'Mozilla/5.0',
  Origin: 'https://silpo.ua',
  Referer: 'https://silpo.ua/',
};

async function callSilpoApi(method, data) {
  const resp = await fetch(SILPO_API, {
    method: 'POST',
    headers: SILPO_HEADERS,
    body: JSON.stringify({ method, data }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Silpo API error: ${resp.status} - ${text.substring(0, 200)}`);
  }

  return resp.json();
}

async function fetchSilpoCategoryTree() {
  const data = await callSilpoApi('GetCategories', {
    deliveryType: 'DeliveryHome',
    filialId: 2028,
  });

  return Array.isArray(data?.tree) ? data.tree : [];
}

export async function getSilpoCategories() {
  const allCats = await fetchSilpoCategoryTree();
  return flattenParentCategories(allCats);
}

export async function getSilpoProducts(categoryId) {
  let categoryName = '';

  if (categoryId) {
    try {
      const allCats = await fetchSilpoCategoryTree();
      // Nested Silpo categories are common, so a shallow lookup would drop the
      // category label for child categories in the UI.
      const category = findCategoryById(allCats, categoryId);
      if (category?.name) {
        categoryName = category.name;
      }
    } catch {
      // Falling back to an empty category label is safer than failing the whole load.
    }
  }

  const allProducts = [];
  const pageSize = 100;
  let offset = 0;
  let total = null;

  while (true) {
    // The API uses inclusive From/To ranges instead of classic page numbers.
    const data = {
      deliveryType: 'DeliveryHome',
      filialId: 2028,
      From: offset + 1,
      To: offset + pageSize,
      RankedResultsOnly: false,
    };

    if (categoryId) {
      data.categoryId = Number.parseInt(categoryId, 10) || 0;
    }

    const payload = await callSilpoApi('GetSimpleCatalogItems', data);
    const items = Array.isArray(payload?.items) ? payload.items : [];

    if (total === null) {
      total = payload?.itemsCount ?? items.length;
    }

    for (const item of items) {
      allProducts.push(normalizeProduct(item, categoryName));
    }

    offset += pageSize;
    if (items.length < pageSize || allProducts.length >= total) {
      break;
    }
  }

  return {
    total: allProducts.length,
    products: allProducts,
  };
}

function normalizeProduct(item, categoryName = '') {
  const price = Number(item?.price) || 0;
  const oldPrice = Number(item?.oldPrice) || null;
  let discount = null;

  if (oldPrice && oldPrice > price) {
    discount = Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  return {
    id: item?.id ?? item?.article ?? item?.slug ?? '',
    store: 'Сільпо',
    name: item?.name || item?.title || 'Без назви',
    category: categoryName,
    price,
    oldPrice,
    discount,
    unit: item?.unitText || item?.unit || '—',
    url: item?.slug ? `https://silpo.ua/product/${item.slug}` : '#',
    image: item?.mainImage || null,
  };
}
