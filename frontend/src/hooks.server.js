import { json, redirect } from '@sveltejs/kit';
import { javaRequest, JavaError } from '#lib/server/java.js';

/** @type {import('@sveltejs/kit/hooks').Handle} */
export async function handle({ event, resolve }) {
    event.locals.user = null;
    event.locals.authError = '';
    if (!event.route.id) return resolve(event);

    const isApi = event.route.id.startsWith('/api/');
    const publicPage = event.url.pathname === '/login' || event.url.pathname === '/register';
    const publicApi = ['/api/auth/login', '/api/auth/register', '/api/auth/logout'].includes(event.url.pathname);
    if (isApi && publicApi) return resolve(event);

    if (event.cookies.get('accessToken') || event.cookies.get('refreshToken')) {
        try {
            event.locals.user = await javaRequest(event, 'auth/me');
        } catch (error) {
            if (!(error instanceof JavaError) || error.status !== 401) {
                event.locals.authError = error instanceof Error ? error.message : 'Не удалось проверить вход.';
            }
        }
    }

    if (isApi && event.locals.authError) {
        return json({ error: event.locals.authError }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
    if (!event.locals.user && !event.locals.authError && !publicPage) {
        if (isApi) return json({ error: 'Войдите в аккаунт.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
        redirect(303, '/login');
    }
    if (event.locals.user && publicPage) redirect(303, '/');
    return resolve(event);
}
