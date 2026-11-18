import { error, redirect } from '@sveltejs/kit';
import { javaRequest, JavaError } from '#lib/server/java.js';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
    const { user, authError } = await event.parent();
    if (authError) error(503, authError);
    if (user?.role !== 'ADMIN') error(403, 'Недостаточно прав для редактирования студента.');

    try {
        /** @type {import('#lib/studentTypes.js').Student} */
        const student = await javaRequest(event, `requests/${encodeURIComponent(event.params.id)}`);
        return { student };
    } catch (exception) {
        if (exception instanceof JavaError && exception.status === 401) redirect(303, '/login');
        error(exception instanceof JavaError ? exception.status : 500,
            exception instanceof Error ? exception.message : 'Не удалось загрузить студента.');
    }
}
