<script>
    import { getContext } from 'svelte';

    /** @type {App.State} */
    const app = getContext('app');
</script>

<svelte:head>
    <title>Профиль</title>
</svelte:head>


<main class="profile-page">
    <h1>Профиль</h1>


    <!-- ! Profile data block ------------------------------------------- -->

    <section class="profile-card panel">
        <h2>Данные аккаунта</h2>

        <dl class="details-list">
            <dt>Логин</dt>
            <dd>{app.user?.username ?? '—'}</dd>

            <dt>Email</dt>
            <dd>{app.user?.email || 'Не указан'}</dd>

            <dt>Роль</dt>
            <dd>{app.user?.role ?? '—'}</dd>

            <dt>ID</dt>
            <dd>{app.user?.id ?? '—'}</dd>
        </dl>
    </section>


    <!-- ! Account links block ------------------------------------------- -->

    <div class="page-links">
        <a class="back-link" href="/">К списку студентов</a>
    </div>
</main>
