import { json } from '@sveltejs/kit';
import { getStudents, clearStudentsCache } from '#lib/server/students.js';
import { clearTokens, javaRequest, JavaError, saveTokens, sendToJava } from '#lib/server/java.js';

/** @type {import('./$types').RequestHandler} */
async function handle(event) {
    const path = event.params.path;
    const method = event.request.method;
    const headers = { 'Cache-Control': 'no-store' };

    try {
        if (path === 'auth/logout' && method === 'POST') {
            clearTokens(event);
            return new Response(null, { status: 204, headers });
        }

        if ((path === 'auth/login' || path === 'auth/register') && method === 'POST') {
            const body = await event.request.json().catch(() => null);
            if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
                throw new JavaError(400, 'Укажите логин и пароль.');
            }

            const credentials = { username: body.username, password: body.password };
            if (path === 'auth/register') {
                await sendToJava(path, { method, body: JSON.stringify({ ...credentials, email: body.email || '' }) });
            }
            let tokens;
            try {
                tokens = await sendToJava('auth/login', { method, body: JSON.stringify(credentials) });
            } catch (error) {
                if (path === 'auth/register' && error instanceof JavaError) {
                    throw new JavaError(error.status, `Аккаунт создан, но автоматический вход не удался. ${error.message} Попробуйте войти на странице входа.`);
                }
                throw error;
            }
            saveTokens(event, tokens);
            const user = await javaRequest(event, 'auth/me');
            return json(user, { status: path === 'auth/register' ? 201 : 200, headers });
        }

        const isStudent = /^requests(?:\/[0-9a-f-]{36})?$/i.test(path);
        const isProfile = path === 'auth/me' && method === 'GET';
        if (!isProfile && !isStudent) throw new JavaError(404, 'Адрес не найден.');
        if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            throw new JavaError(405, 'Метод не поддерживается.');
        }

        if (path === 'requests' && method === 'GET' && !event.url.search) {
            return json(await getStudents(event), { headers });
        }

        const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await event.request.text() : undefined;
        const result = await javaRequest(event, path + event.url.search, { method, body });
        if (isStudent && method !== 'GET') clearStudentsCache();
        if (method === 'DELETE') return new Response(null, { status: 204, headers });
        return json(result, { status: method === 'POST' ? 201 : 200, headers });
    } catch (error) {
        const status = error instanceof JavaError ? error.status : 500;
        const message = error instanceof JavaError ? error.message : 'Не удалось обработать запрос.';
        return json({ error: message }, { status, headers });
    }
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
