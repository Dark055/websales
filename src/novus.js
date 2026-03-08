const ZAKAZ_BASE = 'https://stores-api.zakaz.ua';
// Дефолтный магазин Новус — SkyMall Kyiv
const DEFAULT_STORE_ID = '482010105';

export async function getNovusCategories(storeId = DEFAULT_STORE_ID) {
    const resp = await fetch(`${ZAKAZ_BASE}/stores/${storeId}/categories/`, {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0',
            'Accept-Language': 'uk',
        }
    });

    if (!resp.ok) {
        throw new Error(`Novus categories API error: ${resp.status}`);
    }

    const data = await resp.json();

    // Возвращаем плоский список: родительские + дочерние
    const categories = [];
    for (const cat of data) {
        categories.push({
            id: cat.id,
            slug: cat.slug || cat.id,
            title: cat.title.trim(),
            count: cat.count,
            parentId: cat.parent_id,
        });
        if (cat.children) {
            for (const child of cat.children) {
                categories.push({
                    id: child.id,
                    slug: child.slug || child.id,
                    title: `  └ ${child.title.trim()}`,
                    count: child.count,
                    parentId: child.parent_id,
                });
            }
        }
    }
    return categories;
}

export async function getNovusProducts(categoryIdOrSlug, storeId = DEFAULT_STORE_ID) {
    // Если передан ID - получаем slug и название из категорий
    let categorySlug = categoryIdOrSlug;
    let categoryName = '';
    if (categoryIdOrSlug && isNaN(parseInt(categoryIdOrSlug))) {
        // Это уже slug
    } else if (categoryIdOrSlug) {
        // Получаем categories чтобы найти slug и название
        try {
            const catsResp = await fetch(`${ZAKAZ_BASE}/stores/${storeId}/categories/`, {
                headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'uk' }
            });
            const catsData = await catsResp.json();
            for (const cat of catsData) {
                if (String(cat.id) === String(categoryIdOrSlug)) {
                    categorySlug = cat.slug || cat.id;
                    categoryName = cat.title;
                    break;
                }
                if (cat.children) {
                    for (const child of cat.children) {
                        if (String(child.id) === String(categoryIdOrSlug)) {
                            categorySlug = child.slug || child.id;
                            categoryName = child.title;
                            break;
                        }
                    }
                }
            }
        } catch (e) { }
    }

    const products = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const resp = await fetch(
            `${ZAKAZ_BASE}/stores/${storeId}/categories/${categorySlug}/products/?page=${page}`,
            { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'uk' } }
        );

        if (!resp.ok) break;

        const data = await resp.json();
        const results = data.results || data;

        if (!Array.isArray(results) || results.length === 0) {
            hasMore = false;
            break;
        }

        // Каждый результат содержит EAN и детали товара
        for (const item of results) {
            products.push(normalizeNovusProduct(item, categoryName));
        }

        // Проверяем есть ли следующая страница
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

function normalizeNovusProduct(item, categorySlug) {
    const price = item.price ? item.price / 100 : 0; // zakaz.ua хранит цены в копейках
    const oldPrice = item.old_price ? item.old_price / 100 : null;
    let discount = null;

    if (oldPrice && oldPrice > price) {
        discount = Math.round(((oldPrice - price) / oldPrice) * 100);
    } else if (item.discount && item.discount.value) {
        discount = item.discount.value;
    }

    const ean = item.ean || item.id || '';
    const name = item.title || item.name || 'Без назви';

    let unit = item.unit || '—';
    if (unit === 'pcs') unit = 'шт';
    else if (unit === 'kg') unit = 'кг';

    if (item.weight) {
        if (item.weight >= 1000) unit = (item.weight / 1000) + ' кг';
        else unit = item.weight + ' г';
    } else if (item.volume) {
        if (item.volume >= 1000) unit = (item.volume / 1000) + ' л';
        else unit = item.volume + ' мл';
    }

    return {
        store: 'Новус',
        name: name,
        category: categorySlug || '',
        price: price,
        oldPrice: oldPrice,
        discount: discount,
        unit: unit,
        url: `https://novus.zakaz.ua/uk/search/?q=${encodeURIComponent(name)}`,
        image: item.img ? item.img.s150x150 || item.img.s350x350 || null : null,
    };
}
