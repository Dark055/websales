const FORA_API = 'https://api.catalog.ecom.fora.ua/api/2.0/exec/EcomCatalogGlobal';
const FORA_FILIAL = 310;
const FORA_MERCHANT = 2;

export async function getForaCategories() {
    const body = {
        method: 'GetCategories',
        data: {
            deliveryType: 2,
            filialId: FORA_FILIAL,
            merchantId: FORA_MERCHANT,
        },
    };

    const resp = await fetch(FORA_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify(body),
    });

    if (!resp.ok) {
        throw new Error(`Fora categories API error: ${resp.status}`);
    }

    const data = await resp.json();
    const allCats = data.tree || [];

    const roots = allCats.filter(c => c.parentId === null || c.parentId === 0);
    const children = allCats.filter(c => c.parentId !== null && c.parentId !== 0);

    const result = [];
    for (const root of roots.sort((a, b) => a.order - b.order)) {
        if (root.itemsCount === 0) continue;
        result.push({
            id: root.id,
            slug: root.slug,
            title: root.name,
            count: root.itemsCount,
        });
        const kids = children.filter(c => c.parentId === root.id).sort((a, b) => a.order - b.order);
        for (const kid of kids) {
            if (kid.itemsCount === 0) continue;
            result.push({
                id: kid.id,
                slug: kid.slug,
                title: `  └ ${kid.name}`,
                count: kid.itemsCount,
            });
        }
    }
    return result;
}

export async function getForaProducts(categoryId) {
    let categoryName = '';
    const catBody = {
        method: 'GetCategories',
        data: { deliveryType: 2, filialId: FORA_FILIAL, merchantId: FORA_MERCHANT },
    };

    if (categoryId) {
        try {
            const catsResp = await fetch(FORA_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json;charset=UTF-8', 'User-Agent': 'Mozilla/5.0' },
                body: JSON.stringify(catBody),
            });
            const catsData = await catsResp.json();
            const allCats = catsData.tree || [];
            const cat = allCats.find(c => c.id === (parseInt(categoryId) || 0));
            if (cat) categoryName = cat.name;
        } catch (e) { }
    }

    const allProducts = [];
    const PAGE_SIZE = 50;
    let offset = 0;
    let total = null;

    while (true) {
        const body = {
            method: 'GetSimpleCatalogItems',
            data: {
                deliveryType: 2,
                filialId: FORA_FILIAL,
                merchantId: FORA_MERCHANT,
                From: offset + 1,
                To: offset + PAGE_SIZE,
                RankedResultsOnly: false,
            },
        };
        if (categoryId) body.data.categoryId = parseInt(categoryId) || 0;

        const resp = await fetch(FORA_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=UTF-8', 'User-Agent': 'Mozilla/5.0' },
            body: JSON.stringify(body),
        });

        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Fora API error: ${resp.status} — ${text.substring(0, 200)}`);
        }

        const data = await resp.json();
        const items = data.items || [];
        if (total === null) total = data.itemsCount || items.length;

        for (const item of items) {
            allProducts.push(normalizeProduct(item, categoryName));
        }

        offset += PAGE_SIZE;
        if (items.length < PAGE_SIZE || allProducts.length >= total) break;
    }

    return {
        total: allProducts.length,
        products: allProducts,
    };
}

function normalizeProduct(item, categoryName = '') {
    const price = item.price || 0;
    const oldPrice = item.oldPrice || null;
    let discount = null;

    if (oldPrice && oldPrice > price) {
        discount = Math.round(((oldPrice - price) / oldPrice) * 100);
    }

    return {
        store: 'Фора',
        name: item.name || item.title || 'Без назви',
        category: categoryName,
        price: price,
        oldPrice: oldPrice,
        discount: discount,
        unit: item.unitText || item.unit || '—',
        url: item.slug ? `https://fora.ua/product/${item.slug}` : '#',
        image: item.mainImage || null,
    };
}
