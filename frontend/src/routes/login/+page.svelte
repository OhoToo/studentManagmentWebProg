<script>
    import RegistrationOrAuth from '../registrationOrAuth.svelte';
</script>


<svelte:head>
    <title>Вход</title>
</svelte:head>


<main class="auth-page login-page panel">
    <!-- ! Login form block ------------------------------------------- -->

    <h1>Вход</h1>
    <RegistrationOrAuth />


    <!-- ! Registration link block ------------------------------------------- -->

    <p>Ещё нет аккаунта? <a href="/register">Зарегистрироваться</a></p>
</main>
