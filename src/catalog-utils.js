const ROOT_KEY = '__root__';
const TREE_MARKER = '\u2514';

function getNumericSortValue(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getCategoryTitle(category) {
  return String(category?.name ?? category?.title ?? '').trim();
}

function buildIndentedTitle(title, depth) {
  if (depth <= 0) return title;
  return `${'  '.repeat(depth)}${TREE_MARKER} ${title}`;
}

function compareCategories(a, b) {
  const orderDiff =
    getNumericSortValue(a?.order ?? a?.position) -
    getNumericSortValue(b?.order ?? b?.position);

  if (orderDiff !== 0) {
    return orderDiff;
  }

  return getCategoryTitle(a).localeCompare(getCategoryTitle(b), 'uk');
}

export function flattenParentCategories(categories) {
  const list = Array.isArray(categories) ? categories : [];
  const knownIds = new Set(
    list
      .map(category => category?.id)
      .filter(id => id !== null && id !== undefined && id !== '')
      .map(id => String(id))
  );

  const childrenByParent = new Map();

  for (const category of list) {
    const rawParentId = category?.parentId ?? category?.parent_id ?? null;
    const parentKey =
      rawParentId === null ||
      rawParentId === undefined ||
      rawParentId === 0 ||
      rawParentId === '0' ||
      !knownIds.has(String(rawParentId))
        ? ROOT_KEY
        : String(rawParentId);

    if (!childrenByParent.has(parentKey)) {
      childrenByParent.set(parentKey, []);
    }

    childrenByParent.get(parentKey).push(category);
  }

  for (const bucket of childrenByParent.values()) {
    bucket.sort(compareCategories);
  }

  const flattened = [];

  function visit(parentKey, depth) {
    const children = childrenByParent.get(parentKey) || [];

    for (const category of children) {
      const title = getCategoryTitle(category);
      const count = category?.itemsCount ?? category?.count ?? 0;

      if (!title || count === 0) {
        visit(String(category?.id), depth);
        continue;
      }

      flattened.push({
        id: category.id,
        slug: category.slug ?? category.id,
        title: buildIndentedTitle(title, depth),
        count,
        parentId: category?.parentId ?? category?.parent_id ?? null,
      });

      visit(String(category.id), depth + 1);
    }
  }

  visit(ROOT_KEY, 0);

  return flattened;
}

export function flattenNestedCategories(categories, depth = 0) {
  const list = Array.isArray(categories) ? categories : [];
  const flattened = [];

  for (const category of [...list].sort(compareCategories)) {
    const title = getCategoryTitle(category);
    const count = category?.itemsCount ?? category?.count ?? 0;

    if (title && count !== 0) {
      flattened.push({
        id: category.id,
        slug: category.slug ?? category.id,
        title: buildIndentedTitle(title, depth),
        count,
        parentId: category?.parentId ?? category?.parent_id ?? null,
      });
    }

    const nextDepth = title && count !== 0 ? depth + 1 : depth;
    const children = flattenNestedCategories(category?.children || [], nextDepth);
    if (children.length > 0) {
      flattened.push(...children);
    }
  }

  return flattened;
}

export function findCategoryById(categories, categoryId) {
  if (!categoryId) return null;

  const expectedId = String(categoryId);
  const queue = Array.isArray(categories) ? [...categories] : [];

  while (queue.length > 0) {
    const category = queue.shift();

    if (String(category?.id) === expectedId) {
      return category;
    }

    if (Array.isArray(category?.children) && category.children.length > 0) {
      queue.push(...category.children);
    }
  }

  return null;
}

function getStableProductKey(product) {
  if (!product || !product.store) return null;

  if (product.id !== null && product.id !== undefined && product.id !== '') {
    return `${product.store}:id:${product.id}`;
  }

  return null;
}

export function mergeProductResults(results) {
  const mergedProducts = [];
  const seenKeys = new Set();
  let rawTotal = 0;

  for (const result of Array.isArray(results) ? results : []) {
    if (!result) continue;

    const products = Array.isArray(result.products) ? result.products : [];
    rawTotal += result.total ?? products.length;

    for (const product of products) {
      const key = getStableProductKey(product);

      if (key && seenKeys.has(key)) {
        continue;
      }

      if (key) {
        seenKeys.add(key);
      }

      mergedProducts.push(product);
    }
  }

  return {
    total: mergedProducts.length,
    rawTotal,
    products: mergedProducts,
  };
}
