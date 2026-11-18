<script>
    import { goto } from '$app/navigation';
    import { api, ApiError } from '#lib/api.js';
    import StudentForm from '../../studentForm.svelte';

    /** @param {import('#lib/studentTypes.js').StudentInput} data */
    async function saveStudent(data) {
        let student;
        try {
            student = await api('/api/requests', {
                method: 'POST',
                body: JSON.stringify(data)
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
    <title>Создание студента</title>
</svelte:head>

<main class="details-page">
    <!-- ! Page heading block ------------------------------------------- -->
    <h1>Создание студента</h1>

    <StudentForm onsave={saveStudent} oncancel={() => goto('/')} />
</main>
