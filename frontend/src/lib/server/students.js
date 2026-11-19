import { javaRequest, JavaError } from './java.js';

const cacheTime = 30_000;
/** @type {import('../studentTypes.js').Student[] | null} */
let cachedStudents = null;
let expiresAt = 0;
let version = 0;

export function clearStudentsCache() {
    cachedStudents = null;
    expiresAt = 0;
    version += 1;
}

/** @param {import('@sveltejs/kit').RequestEvent} event */
export async function getStudents(event) {
    if (!event.locals.user) throw new JavaError(401, 'Войдите в аккаунт.');
    if (cachedStudents && Date.now() < expiresAt) return cachedStudents;

    const requestVersion = version;
    const students = await javaRequest(event, 'requests');
    if (!Array.isArray(students)) {
        throw new JavaError(502, 'Сервер вернул список студентов в неожиданном формате.');
    }
    if (requestVersion === version) {
        cachedStudents = students;
        expiresAt = Date.now() + cacheTime;
    }
    return students;
}
