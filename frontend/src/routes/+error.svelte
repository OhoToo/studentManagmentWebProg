<script>
    import { page } from '$app/state';
</script>

<svelte:head>
    <title>Ошибка {page.status}</title>
</svelte:head>

<!-- ! Error block ------------------------------------------- -->

<main>
    <h1>Ошибка {page.status}</h1>
    <p>{page.error?.message || 'Не удалось открыть страницу.'}</p>
    <a href="/">К списку студентов</a>
</main>
