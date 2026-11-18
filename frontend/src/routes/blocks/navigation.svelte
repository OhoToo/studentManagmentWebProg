<script>
    import logo from '../../../../favicon.png';
    import { goto } from '$app/navigation';
    import { api } from '#lib/api.js';


    /** @type {{ links: { href: string, text: string }[], user?: App.User | null }} */
    let { links, user = null } = $props();

    let loading = $state(false);
    let message = $state('');

    async function logout() {
        if (loading) return;
        loading = true;
        message = '';
        try {
            await api('/api/auth/logout', { method: 'POST' });
            await goto('/login', { refreshAll: true });
        } catch (error) {
            message = error instanceof Error ? error.message : 'Не удалось выйти.';
        } finally {
            loading = false;
        }
    }

</script>


<!-- ! Navigation block ------------------------------------------- -->

<div class="navigation">
    <header class="panel">
        <img src={logo} alt="Иконка">

        <nav>
            {#each links as link }
                <a href={link.href}>{link.text}</a>
            {/each}

            <button class="wrapper" onclick={() => window.history.back()}>назад</button>

            {#if user}
                <button class="wrapper" disabled={loading} onclick={logout}>Выйти</button>
            {/if}

        </nav>
    </header>
    <p class="form-message">{message}</p>
</div>


<style>
    .navigation {
        width: calc(100% - 48px);
        max-width: 1280px;
        margin: 20px auto 0;
    }

    header, nav {
        display: flex;
        align-items: center;
    }

    header {
        gap: 24px;
        padding: 14px 20px;
    }

    header > img {
        width: 30px;
        height: 30px;
        object-fit: contain;
        flex-shrink: 0;
    }

    nav {
        flex: 1;
        flex-wrap: wrap;
        gap: 4px;
        min-width: 0;
    }

    nav a, .wrapper {
        min-height: 36px;
        padding: 8px 12px;
        border: 0;
        color: var(--muted);
        font-weight: 400;
        text-decoration: none;
    }

    nav a:hover, .wrapper:hover {
        color: var(--text);
        background: var(--surface-hover);
    }

    .wrapper:first-of-type {
        margin-left: auto;
    }

    @media (max-width: 640px) {
        .navigation {
            width: calc(100% - 32px);
            margin-top: 16px;
        }

        header {
            align-items: flex-start;
            gap: 12px;
            padding: 14px;
        }

        nav {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            font-size: 13px;
        }

        nav a, .wrapper {
            padding: 8px;
            text-align: left;
        }

        .wrapper:first-of-type {
            margin-left: 0;
        }
    }
</style>
