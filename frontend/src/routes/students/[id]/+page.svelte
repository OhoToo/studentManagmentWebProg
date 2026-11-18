<script>
    import { getContext } from 'svelte';
    import { goto } from '$app/navigation';
    import { api, ApiError } from '#lib/api.js';


    let { data } = $props();
    /** @type {App.State} */
    const app = getContext('app');
    let student = $derived(data.student);
    let deleting = $state(false);
    let message = $state('');

    async function deleteStudent() {
        if (deleting) return;
        if (!window.confirm(`Удалить студента ${student.fullName}?`)) return;
        deleting = true;
        message = '';
        try {
            await api(`/api/requests/${student.ID}`, { method: 'DELETE' });
            await goto('/', { refreshAll: true });
        } catch (error) {
            message = error instanceof Error ? error.message : 'Не удалось удалить студента.';
            if (error instanceof ApiError && error.status === 401) {
                await goto('/login', { refreshAll: true });
            }
        } finally {
            deleting = false;
        }
    }
</script>


<svelte:head>
    <title>{student.fullName}</title>
</svelte:head>


<main class="details-page">
    <!-- ! Student data block ------------------------------------------- -->

    <h1>{student.fullName}</h1>

    <dl class="details-list panel">
        <dt>Номер ИСУ</dt>
        <dd>{student.ISU}</dd>

        <dt>Группа</dt>
        <dd>{student.group}</dd>

        <dt>Иностранный студент</dt>
        <dd>{student.isForeign ? 'Да' : 'Нет'}</dd>

        <dt>Номер общежития</dt>
        <dd>{student.dormNumber ?? 'Не указан'}</dd>

        <dt>Комната</dt>
        <dd>{student.room ?? 'Не указана'}</dd>

        <dt>Дата заселения</dt>
        <dd>{student.dateArrived ?? 'Не указана'}</dd>

        <dt>Заметки</dt>
        <dd>{student.notes || 'Нет заметок'}</dd>

        <dt>ID</dt>
        <dd>{student.ID}</dd>
    </dl>


    <!-- ! Student actions block ------------------------------------------- -->

    <div class="page-links">
        {#if app.user?.role === 'ADMIN'}
            <a href={`/students/${student.ID}/edit`}>Редактировать</a>
            <button type="button" disabled={deleting} onclick={deleteStudent}>{deleting ? 'Удаление…' : 'Удалить студента'}</button>
        {/if}
        <a href="/">К списку студентов</a>
    </div>
    <p class="form-message">{message}</p>
</main>

<style>
    .page-links {
        margin-top: 28px;
    }
</style>
