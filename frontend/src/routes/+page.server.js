import { error, redirect } from '@sveltejs/kit';
import { getStudents } from '#lib/server/students.js';
import { JavaError } from '#lib/server/java.js';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
    await event.parent();
    event.depends('students:list');
    try {
        return { students: await getStudents(event) };
    } catch (exception) {
        if (exception instanceof JavaError && exception.status === 401) redirect(303, '/login');
        error(exception instanceof JavaError ? exception.status : 500,
            exception instanceof Error ? exception.message : 'Не удалось загрузить студентов.');
    }
}
