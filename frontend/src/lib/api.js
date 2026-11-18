export class ApiError extends Error {
    /** @param {number} status @param {string} message */
    constructor(status, message) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

/** @param {string} path @param {RequestInit} [options] */
export async function api(path, options = {}) {
    const headers = new Headers(options.headers);
    if (options.body != null && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    let response;
    try {
        response = await fetch(path, { ...options, headers, credentials: 'same-origin' });
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') throw error;
        throw new ApiError(0, 'Не удалось связаться с сервером. Проверьте подключение и повторите попытку.');
    }

    if (response.status === 204) return null;
    const result = await response.json().catch(() => null);

    if (!response.ok) {
        let message = `Ошибка HTTP ${response.status}`;
        if (response.status === 401) message = 'Войдите в аккаунт заново.';
        else if (response.status === 403) message = 'Недостаточно прав для этой операции.';
        else if (response.status === 404) message = 'Запрошенные данные не найдены.';
        else if (response.status >= 500) message = 'Сервер временно недоступен. Повторите попытку позже.';

        if (typeof result?.error === 'string' && result.error.trim()) message = result.error;
        throw new ApiError(response.status, message);
    }

    if (result === null) {
        throw new ApiError(502, 'Сервер вернул ответ в неожиданном формате. Ожидался JSON.');
    }
    return result;
}
