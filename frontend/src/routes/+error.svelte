<script>
    import { page } from '$app/state';
    import { refreshAll } from '$app/navigation';

    let loading = $state(false);

    async function retry() {
        loading = true;
        try {
            await refreshAll();
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Ошибка {page.status}</title>
</svelte:head>

<!-- ! Error block ------------------------------------------- -->

<main>
    {#if page.status === 404}
        <h1>Страница не найдена</h1>
        <p>Такой страницы или студента нет.</p>
    {:else}
        <h1>Ошибка {page.status}</h1>
        <p>{page.error?.message || 'Не удалось открыть страницу.'}</p>
    {/if}
    {#if page.status >= 500}
        <button type="button" disabled={loading} onclick={retry}>
            {loading ? 'Загрузка…' : 'Повторить'}
        </button>
    {/if}
    <a href="/">К списку студентов</a>
</main>
