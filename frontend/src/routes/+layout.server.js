import { redirect } from '@sveltejs/kit';
import { javaRequest, JavaError } from '#lib/server/java.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
    event.depends('auth:user');
    event.setHeaders({ 'Cache-Control': 'no-store' });
    const publicPage = event.url.pathname === '/login' || event.url.pathname === '/register';
    /** @type {App.User | null} */
    let user = null;
    let authError = '';

    try {
        user = await javaRequest(event, 'auth/me');
    } catch (error) {
        if (!(error instanceof JavaError) || error.status !== 401) {
            authError = error instanceof Error ? error.message : 'Не удалось проверить вход.';
        }
    }

    if (!user && !authError && !publicPage) redirect(303, '/login');
    if (user && publicPage) redirect(303, '/');
    return { user, authError };
}
