<script>
    import { goto } from '$app/navigation';
    import { api } from '#lib/api.js';


    let { registration = false } = $props();
    let loading = $state(false);
    let message = $state('');

    /** @param {HTMLFormElement} form */
    async function submitForm(form) {
        if (loading) return;

        const fields = new FormData(form);
        const login = String(fields.get('login') ?? '').trim();
        const password = String(fields.get('password') ?? '');

        if (!login || !password.trim()) {
            message = 'Укажите логин и пароль.';
            return;
        }

        let url;
        let data;
        if (registration) {
            url = '/api/auth/register';
            data = { username: login, password, email: String(fields.get('email') ?? '') };
        } else {
            url = '/api/auth/login';
            data = { username: login, password };
        }

        loading = true;
        message = '';
        try {
            await api(url, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            await goto('/', { refreshAll: true });
        } catch (error) {
            message = error instanceof Error ? error.message : 'Не удалось выполнить запрос. Повторите попытку.';
        } finally {
            loading = false;
        }
    }
</script>

<!-- ! Account form block ------------------------------------------- -->

<section class="account-form">
    <form onsubmit={(event) => {
        event.preventDefault();
        submitForm(event.currentTarget);
    }}>
        <label for="login">Логин</label>
        <input id="login" name="login" type="text" maxlength="50" required>

        <label for="password">Пароль</label>
        <input id="password" name="password" type="password" required>
        {#if registration}
            <label for="email">Email</label>
            <input id="email" name="email" type="email" maxlength="50">
        {/if}
        <button class="primary-button" type="submit" disabled={loading}>
            {loading ? 'Отправка…' : 'Готово'}
        </button>

        <p class="form-message">{message}</p>
    </form>
</section>


<style>
    form {
        display: grid;
        gap: 10px;
    }

    label:not(:first-child) {
        margin-top: 12px;
    }

    button {
        width: 100%;
        margin-top: 18px;
    }
</style>
