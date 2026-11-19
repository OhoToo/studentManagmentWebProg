<script>
    import '../app.css';
    import favicon from '../../../favicon.png';
    import { setContext } from 'svelte';
    import { page, navigating } from '$app/state';
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

{#if navigating.to}
    <p class="form-message">Загрузка страницы…</p>
{/if}

{@render children()}
