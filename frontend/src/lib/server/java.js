import { BACKEND_URL } from '$app/env/private';

export class JavaError extends Error {
    /** @param {number} status @param {string} message */
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

/** @param {string} path @param {RequestInit} options @param {string} [token] */
export async function sendToJava(path, options = {}, token) {
    const headers = new Headers({ 'Accept': 'application/json' });
    if (options.body) headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);

    let response;
    try {
        const address = BACKEND_URL.replace(/\/$/, '');
        response = await fetch(`${address}/api/${path}`, {
            method: options.method || 'GET',
            headers,
            body: options.body,
            redirect: 'error',
            signal: AbortSignal.timeout(10000)
        });
    } catch {
        throw new JavaError(503, 'Не удалось связаться с сервером Java. Попробуйте позже.');
    }

    if (response.status === 204) return null;
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new JavaError(response.status, data?.error || `Ошибка сервера: ${response.status}`);
    }
    if (!data) throw new JavaError(502, 'Сервер вернул некорректный ответ.');
    return data;
}

/** @param {import('@sveltejs/kit').RequestEvent} event */
export function clearTokens(event) {
    event.cookies.delete('accessToken', { path: '/' });
    event.cookies.delete('refreshToken', { path: '/' });
}

/**
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @param {{ accessToken: string, refreshToken: string }} tokens
 */
export function saveTokens(event, tokens) {
    if (!tokens.accessToken || !tokens.refreshToken) {
        throw new JavaError(502, 'Сервер не вернул токены авторизации.');
    }
    const options = { path: '/', httpOnly: true, sameSite: /** @type {const} */ ('lax'), secure: event.url.protocol === 'https:' };
    event.cookies.set('accessToken', tokens.accessToken, options);
    event.cookies.set('refreshToken', tokens.refreshToken, options);
}

/** @param {import('@sveltejs/kit').RequestEvent} event */
async function refreshTokens(event) {
    const refreshToken = event.cookies.get('refreshToken');
    if (!refreshToken) {
        clearTokens(event);
        throw new JavaError(401, 'Войдите в аккаунт.');
    }
    try {
        const tokens = await sendToJava('auth/refresh', {
            method: 'POST', body: JSON.stringify({ refreshToken })
        });
        saveTokens(event, tokens);
        return tokens.accessToken;
    } catch (error) {
        if (error instanceof JavaError && error.status === 401) clearTokens(event);
        throw error;
    }
}

/** @param {import('@sveltejs/kit').RequestEvent} event @param {string} path @param {RequestInit} options */
export async function javaRequest(event, path, options = {}) {
    let token = event.cookies.get('accessToken');
    if (!token) token = await refreshTokens(event);
    try {
        return await sendToJava(path, options, token);
    } catch (error) {
        if (!(error instanceof JavaError) || error.status !== 401) throw error;
    }

    token = await refreshTokens(event);
    try {
        return await sendToJava(path, options, token);
    } catch (error) {
        if (error instanceof JavaError && error.status === 401) clearTokens(event);
        throw error;
    }
}
