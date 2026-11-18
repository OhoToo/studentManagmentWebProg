<script>
    import '../app.css';
    import favicon from '../../../favicon.png';
    import { setContext } from 'svelte';
    import { page } from '$app/state';
    import { refreshAll } from '$app/navigation';
    import Navigation from './blocks/navigation.svelte';
    import { links as baseLinks } from './basePages';


    let { data, children } = $props();
    let user = $derived(data.user);
    setContext('app', { get user() { return user; } });

    let links = $derived(baseLinks.filter(link => {
        const accountLink = link.href === '/login' || link.href === '/register';
        if (user) return !accountLink;
        return accountLink;
    }));
</script>

<svelte:head>
    <link rel="icon" type="image/png" href={favicon}>
</svelte:head>


<!-- ! Navigation block ------------------------------------------- -->

{#if page.route.id !== '/login'}
    <Navigation {links} {user}></Navigation>
{/if}


<!-- ! Page content block ------------------------------------------- -->

{#if data.authError && page.route.id !== '/login' && page.route.id !== '/register'}
    <main>
        <h1>Не удалось открыть страницу</h1>
        <p class="form-message">{data.authError}</p>
        <button type="button" onclick={() => refreshAll()}>Повторить</button>
        <a href="/login">Ко входу</a>
    </main>
{:else}
    {@render children()}
{/if}
