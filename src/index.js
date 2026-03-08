import { mergeProductResults } from './catalog-utils.js';
import { getSilpoCategories, getSilpoProducts } from './silpo.js';
import { getNovusCategories, getNovusProducts } from './novus.js';
import { getForaCategories, getForaProducts } from './fora.js';
import { HTML_PAGE } from './page.js';

function parseCategoryParam(categoryParam) {
  if (!categoryParam) {
    return [''];
  }

  const categories = categoryParam
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);

  return categories.length > 0 ? categories : [''];
}

async function loadProductsForCategories(categories, loader) {
  const settlements = await Promise.allSettled(categories.map(category => loader(category)));
  const results = [];
  const errors = [];

  for (const settlement of settlements) {
    if (settlement.status === 'fulfilled') {
      results.push(settlement.value);
    } else {
      errors.push(settlement.reason?.message || 'Unknown products loading error');
    }
  }

  const merged = mergeProductResults(results);
  if (errors.length > 0) {
    merged.errors = errors;
  }

  return merged;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === '/api/silpo/categories') {
        const data = await getSilpoCategories();
        return json(data, corsHeaders);
      }

      if (path === '/api/silpo/products') {
        const categories = parseCategoryParam(url.searchParams.get('category'));
        const data = await loadProductsForCategories(categories, category => getSilpoProducts(category));
        return json(data, corsHeaders);
      }

      if (path === '/api/novus/categories') {
        const data = await getNovusCategories();
        return json(data, corsHeaders);
      }

      if (path === '/api/novus/products') {
        const categories = parseCategoryParam(url.searchParams.get('category'));
        const data = await loadProductsForCategories(categories, category => getNovusProducts(category));
        return json(data, corsHeaders);
      }

      if (path === '/api/fora/categories') {
        const data = await getForaCategories();
        return json(data, corsHeaders);
      }

      if (path === '/api/fora/products') {
        const categories = parseCategoryParam(url.searchParams.get('category'));
        const data = await loadProductsForCategories(categories, category => getForaProducts(category));
        return json(data, corsHeaders);
      }

      if (path === '/' || path === '/index.html') {
        return new Response(HTML_PAGE, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (err) {
      return json({ error: err.message }, corsHeaders, 500);
    }
  },
};

function json(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
    },
  });
}
