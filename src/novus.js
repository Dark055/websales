import { findCategoryById, flattenNestedCategories } from './catalog-utils.js';

const ZAKAZ_BASE = 'https://stores-api.zakaz.ua';
const DEFAULT_STORE_ID = '482010105';
const NOVUS_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'Mozilla/5.0',
  'Accept-Language': 'uk',
};

async function fetchNovusCategoriesTree(storeId = DEFAULT_STORE_ID) {
  const resp = await fetch(`${ZAKAZ_BASE}/stores/${storeId}/categories/`, {
    headers: NOVUS_HEADERS,
  });

  if (!resp.ok) {
    throw new Error(`Novus categories API error: ${resp.status}`);
  }

  const data = await resp.json();
  return Array.isArray(data) ? data : [];
}

export async function getNovusCategories(storeId = DEFAULT_STORE_ID) {
  const data = await fetchNovusCategoriesTree(storeId);
  return flattenNestedCategories(data);
}

export async function getNovusProducts(categoryIdOrSlug, storeId = DEFAULT_STORE_ID) {
  let categorySlug = categoryIdOrSlug;
  let categoryName = '';

  if (categoryIdOrSlug) {
    try {
      const categories = await fetchNovusCategoriesTree(storeId);
      // The UI stores the selected category id, but Novus product requests are
      // more reliable when we translate it back to the provider slug first.
      const category = findCategoryById(categories, categoryIdOrSlug);

      if (category) {
        categorySlug = category.slug || category.id;
        categoryName = String(category.title || '').trim();
      }
    } catch {
      // If category metadata lookup fails, we still try the products endpoint directly.
    }
  }

  const products = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const resp = await fetch(
      `${ZAKAZ_BASE}/stores/${storeId}/categories/${categorySlug}/products/?page=${page}`,
      { headers: NOVUS_HEADERS }
    );

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Novus products API error: ${resp.status} - ${text.substring(0, 200)}`);
    }

    const data = await resp.json();
    const results = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
        ? data
        : [];

    if (results.length === 0) {
      break;
    }

    for (const item of results) {
      products.push(normalizeNovusProduct(item, categoryName));
    }

    if (data?.next) {
      page += 1;
    } else {
      hasMore = false;
    }
  }

  return {
    total: products.length,
    products,
  };
}

function normalizeNovusProduct(item, categoryName) {
  const price = item?.price ? Number(item.price) / 100 : 0;
  const oldPrice = item?.old_price ? Number(item.old_price) / 100 : null;
  let discount = null;

  if (oldPrice && oldPrice > price) {
    discount = Math.round(((oldPrice - price) / oldPrice) * 100);
  } else if (item?.discount?.value) {
    discount = Number(item.discount.value) || null;
  }

  const name = String(item?.title ?? item?.name ?? 'Без назви').trim();
  let unit = item?.unit || '—';

  if (unit === 'pcs') unit = 'шт';
  else if (unit === 'kg') unit = 'кг';

  if (item?.weight) {
    unit = item.weight >= 1000 ? `${item.weight / 1000} кг` : `${item.weight} г`;
  } else if (item?.volume) {
    unit = item.volume >= 1000 ? `${item.volume / 1000} л` : `${item.volume} мл`;
  }

  const itemUrl = item?.web_url || item?.url || '';
  const absoluteUrl = itemUrl
    ? itemUrl.startsWith('http')
      ? itemUrl
      : `https://novus.zakaz.ua${itemUrl}`
    : `https://novus.zakaz.ua/uk/search/?q=${encodeURIComponent(name)}`;

  return {
    id: item?.ean || item?.sku || item?.id || '',
    store: 'Новус',
    name,
    category: categoryName || '',
    price,
    oldPrice,
    discount,
    unit,
    url: absoluteUrl,
    image: item?.img ? item.img.s150x150 || item.img.s350x350 || null : null,
  };
}
