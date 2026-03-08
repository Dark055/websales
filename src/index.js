import { getSilpoCategories, getSilpoProducts } from './silpo.js';
import { getNovusCategories, getNovusProducts } from './novus.js';
import { getForaCategories, getForaProducts } from './fora.js';
import { HTML_PAGE } from './page.js';

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // API routes
            if (path === '/api/silpo/categories') {
                const data = await getSilpoCategories();
                return json(data, corsHeaders);
            }

            if (path === '/api/silpo/products') {
                const categoryParam = url.searchParams.get('category') || '';
                const categories = categoryParam ? categoryParam.split(',') : [''];
                const offset = parseInt(url.searchParams.get('offset') || '0');
                const limit = parseInt(url.searchParams.get('limit') || '100');

                const results = await Promise.all(
                    categories.map(cat => getSilpoProducts(cat, offset, limit))
                );

                const data = {
                    total: results.reduce((sum, res) => sum + (res.total || 0), 0),
                    products: results.flatMap(res => res.products || [])
                };
                return json(data, corsHeaders);
            }

            if (path === '/api/novus/categories') {
                const data = await getNovusCategories();
                return json(data, corsHeaders);
            }

            if (path === '/api/novus/products') {
                const categoryParam = url.searchParams.get('category') || '';
                const categories = categoryParam ? categoryParam.split(',') : [''];

                const results = await Promise.all(
                    categories.map(cat => getNovusProducts(cat))
                );

                const data = {
                    total: results.reduce((sum, res) => sum + (res.total || 0), 0),
                    products: results.flatMap(res => res.products || [])
                };
                return json(data, corsHeaders);
            }

            if (path === '/api/fora/categories') {
                const data = await getForaCategories();
                return json(data, corsHeaders);
            }

            if (path === '/api/fora/products') {
                const categoryParam = url.searchParams.get('category') || '';
                const categories = categoryParam ? categoryParam.split(',') : [''];
                const offset = parseInt(url.searchParams.get('offset') || '0');
                const limit = parseInt(url.searchParams.get('limit') || '50');

                const results = await Promise.all(
                    categories.map(cat => getForaProducts(cat, offset, limit))
                );

                const data = {
                    total: results.reduce((sum, res) => sum + (res.total || 0), 0),
                    products: results.flatMap(res => res.products || [])
                };
                return json(data, corsHeaders);
            }

            // Главная страница
            if (path === '/' || path === '/index.html') {
                return new Response(HTML_PAGE, {
                    headers: { 'Content-Type': 'text/html; charset=utf-8' },
                });
            }

            return new Response('Not Found', { status: 404 });
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
