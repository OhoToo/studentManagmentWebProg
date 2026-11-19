import { error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load(event) {
    event.depends('auth:user');
    event.setHeaders({ 'Cache-Control': 'no-store' });
    if (event.locals.authError) error(503, event.locals.authError);
    return { user: event.locals.user, authError: '' };
}
