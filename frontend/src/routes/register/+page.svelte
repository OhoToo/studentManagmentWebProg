<script>
    import RegistrationOrAuth from '../registrationOrAuth.svelte';
</script>


<svelte:head>
    <title>Регистрация</title>
</svelte:head>


<main class="auth-page panel">
    <!-- ! Registration form block ------------------------------------------- -->

    <h1>Регистрация</h1>
    <RegistrationOrAuth registration={true} />


    <!-- ! Login link block ------------------------------------------- -->

    <p>Уже есть аккаунт? <a href="/login">Войти</a></p>
</main>
