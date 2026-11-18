<script>
    import { goto } from '$app/navigation';
    import { api, ApiError } from '#lib/api.js';
    import StudentForm from '../../../studentForm.svelte';

    let { data } = $props();
    let student = $derived(data.student);

    /** @param {import('#lib/studentTypes.js').StudentInput} values */
    async function saveStudent(values) {
        try {
            await api(`/api/requests/${student.ID}`, {
                method: 'PUT',
                body: JSON.stringify(values)
            });
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                await goto('/login', { refreshAll: true });
            }
            throw error;
        }
        await goto(`/students/${student.ID}`, { refreshAll: true });
    }
</script>

<svelte:head>
    <title>Редактирование студента</title>
</svelte:head>

<main class="details-page">
    <!-- ! Page heading block ------------------------------------------- -->
    <h1>Редактирование студента</h1>

    {#key student.ID}
        <StudentForm {student} onsave={saveStudent} oncancel={() => goto(`/students/${student.ID}`)} />
    {/key}
</main>
