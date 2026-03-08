import { flattenParentCategories } from './catalog-utils.js';

const FORA_API = 'https://api.catalog.ecom.fora.ua/api/2.0/exec/EcomCatalogGlobal';
const FORA_FILIAL = 310;
const FORA_MERCHANT = 2;
const FORA_HEADERS = {
  'Content-Type': 'application/json;charset=UTF-8',
  'User-Agent': 'Mozilla/5.0',
};

async function callForaApi(method, data) {
  const resp = await fetch(FORA_API, {
    method: 'POST',
    headers: FORA_HEADERS,
    body: JSON.stringify({ method, data }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Fora API error: ${resp.status} - ${text.substring(0, 200)}`);
  }

  return resp.json();
}

async function fetchForaCategoryTree() {
  const data = await callForaApi('GetCategories', {
    deliveryType: 2,
    filialId: FORA_FILIAL,
    merchantId: FORA_MERCHANT,
  });

  return Array.isArray(data?.tree) ? data.tree : [];
}

export async function getForaCategories() {
  const allCats = await fetchForaCategoryTree();
  return flattenParentCategories(allCats);
}

export async function getForaProducts(categoryId) {
  let categoryName = '';

  if (categoryId) {
    try {
      const allCats = await fetchForaCategoryTree();
      const category = allCats.find(cat => String(cat?.id) === String(categoryId));
      if (category?.name) {
        categoryName = category.name;
      }
    } catch {
      // Falling back to an empty category label is safer than failing the whole load.
    }
  }

  const allProducts = [];
  const pageSize = 50;
  let offset = 0;
  let total = null;

  while (true) {
    const data = {
      deliveryType: 2,
      filialId: FORA_FILIAL,
      merchantId: FORA_MERCHANT,
      From: offset + 1,
      To: offset + pageSize,
      RankedResultsOnly: false,
    };

    if (categoryId) {
      data.categoryId = Number.parseInt(categoryId, 10) || 0;
    }

    const payload = await callForaApi('GetSimpleCatalogItems', data);
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
    store: 'Фора',
    name: item?.name || item?.title || 'Без назви',
    category: categoryName,
    price,
    oldPrice,
    discount,
    unit: item?.unitText || item?.unit || '—',
    url: item?.slug ? `https://fora.ua/product/${item.slug}` : '#',
    image: item?.mainImage || null,
  };
}
