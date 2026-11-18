import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
    const { user, authError } = await parent();
    if (authError) error(503, authError);
    if (user?.role !== 'ADMIN') error(403, 'Недостаточно прав для создания студента.');
}
