<script>
    import { getContext, onDestroy, untrack } from 'svelte';
    import { createStudentView } from '#lib/students.js';
    import earth from '../../../Земля пнг.png';

    let { data } = $props();

    /** @typedef {import('#lib/studentTypes.js').Student} Student */
    /** @typedef {import('#lib/studentTypes.js').StudentInput} StudentInput */
    /** @type {App.State} */
    const app = getContext('app');
    let canEdit = $derived(app.user?.role === 'ADMIN');
    /** @type {Student[]} */
    let students = $derived(data.students);
    const view = createStudentView();
    /** @type {Student[]} */
    let visibleStudents = $state([]);
    let totalStudents = $state(0);
    let search = $state('');

    function updateView(list = students) {
        view.changes.next({ students: list, search, filters, sortKeys, start, visibleCount });
    }

    /** @type {Array<{ key: keyof StudentInput, text: string, type?: 'number' | 'date' }>} */
    let filterableStudentKeys = [
        { key: 'fullName', text: 'По имени' },
        { key: 'ISU', text: 'По ИСУ' },
        { key: 'group', text: 'По группе' },
        { key: 'isForeign', text: 'Иностранец' },
        { key: 'dormNumber', text: 'По номеру общежития', type: 'number' },
        { key: 'dateArrived', text: 'По дате прибытия', type: 'date' },
        { key: 'room', text: 'По комнате', type: 'number' },
        { key: 'notes', text: 'По заметкам' }
    ];


    let start = $state(0);
    let visibleCount = $state(20);


    let changerTab = $state('filter');

    /** @type {Record<keyof StudentInput, string>} */
    let filters = $state({
        fullName: '',
        ISU: '',
        group: '',
        isForeign: '',
        dormNumber: '',
        dateArrived: '',
        room: '',
        notes: ''
    });




    const orderBy = Object.freeze({
        ASC: 'ASC',
        DESC: 'DESC'
    });


    /** @type {Array<{ key: keyof StudentInput, text: string, order: 'ASC' | 'DESC', selectionNumber: number }>} */
    let sortKeys = $state([]);
    let selectionCounter = $state(0);
    for(let i = 0; i < filterableStudentKeys.length; i++) {
        sortKeys.push({
            key: filterableStudentKeys[i].key,
            text: filterableStudentKeys[i].text,
            order: orderBy.ASC,
            selectionNumber: 0
        });
    }

    const viewSubscription = view.results.subscribe(result => {
        visibleStudents = result.students;
        totalStudents = result.total;
        start = result.start;
    });
    updateView();

    $effect(() => {
        const list = data.students;
        untrack(() => updateView(list));
    });

    onDestroy(() => {
        viewSubscription.unsubscribe();
        view.changes.complete();
    });
</script>


<svelte:head>
    <title>Студенты</title>
</svelte:head>


<main>
    <!-- ! Page heading block ------------------------------------------- -->

    <div class="page-heading">
        <h1>Студенты</h1>

        {#if canEdit}
            <a class="primary-link" href="/students/new">Добавить студента</a>
        {/if}
    </div>

    <!-- ! Table navigation up block ------------------------------------------- -->

    {#if start > 0}
        <button type="button" class="move-button" onclick={(event) => {
            const step = event.shiftKey ? 5 : 1;
            start = Math.max(0, start - step);
            updateView();
        }}>↑</button>
    {/if}

    <!-- ! Sort | filter block ------------------------------------------- -->

    <div class="table-toolbar">
        <label class="search-field">
            Поиск
            <input type="search" value={search} placeholder="ФИО, ИСУ, группа или другие данные" oninput={(event) => {
                search = event.currentTarget.value;
                start = 0;
                updateView();
            }}>
        </label>
        <button type="button" class="changer-button" popovertarget="changer">
            <img src="" alt="">
            <span>Фильтр / Сортировка</span>
        </button>
    </div>


    <div id="changer" class="panel" popover>
        <div class="changer-tabs">
            <button type="button" class="filter-button" class:selected={changerTab === 'filter'} onclick={() => changerTab = 'filter'}>
                Фильтр
            </button>

            <button type="button" class="sort-button" class:selected={changerTab === 'sort'} onclick={() => changerTab = 'sort'}>
                Сортировка
            </button>
        </div>

        <div class="filter-div" hidden={changerTab !== 'filter'}>
            {#each filterableStudentKeys as field (field.key)}
                <div>
                    <label for={`filter-${field.key}`}>{field.text}</label>

                    {#if field.key === 'isForeign'}
                        <select
                            id={`filter-${field.key}`}
                            value={filters.isForeign}
                            onchange={(event) => {
                                filters.isForeign = event.currentTarget.value;
                                start = 0;
                                updateView();
                            }}
                        >
                            <option value="">Все</option>
                            <option value="true">Да</option>
                            <option value="false">Нет</option>
                        </select>
                    {:else}
                        <input
                            id={`filter-${field.key}`}
                            type={field.type ?? 'text'}
                            value={filters[field.key]}
                            oninput={(event) => {
                                filters[field.key] = event.currentTarget.value;
                                start = 0;
                                updateView();
                            }}
                        >
                    {/if}
                </div>
            {/each}

            <button type="button" onclick={() => {
                for (const field of filterableStudentKeys) {
                    filters[field.key] = '';
                }
                start = 0;
                updateView();
            }}>Сбросить фильтры</button>
        </div>

        <div class="sort-div" hidden={changerTab !== 'sort'}>
            {#each sortKeys as rule (rule.key)}
                <div>
                    <div class="sort-field">
                        <label for={`sort-${rule.key}`}>
                            <input
                                id={`sort-${rule.key}`}
                                type="checkbox"
                                checked={rule.selectionNumber > 0}
                                onchange={(event) => {
                                    if (event.currentTarget.checked) {
                                        selectionCounter += 1;
                                        rule.selectionNumber = selectionCounter;
                                    } else {
                                        rule.selectionNumber = 0;
                                    }
                                    start = 0;
                                    updateView();
                                }}
                            >
                            {rule.text}
                        </label>

                        {#if rule.selectionNumber > 0}
                            <span>Порядок выбора: {rule.selectionNumber}</span>
                        {/if}
                    </div>

                    <div class="sort-order">
                        <button
                            type="button"
                            class:selected={rule.order === orderBy.ASC}
                            disabled={rule.selectionNumber === 0}
                            onclick={() => {
                                rule.order = orderBy.ASC;
                                start = 0;
                                updateView();
                            }}
                        >ASC</button>
                        <button
                            type="button"
                            class:selected={rule.order === orderBy.DESC}
                            disabled={rule.selectionNumber === 0}
                            onclick={() => {
                                rule.order = orderBy.DESC;
                                start = 0;
                                updateView();
                            }}
                        >DESC</button>
                    </div>
                </div>
            {/each}
        </div>
    </div>
    

    <!-- ! Student table block ------------------------------------------- -->


    <div class="table-container panel">
        <table>
            <tbody>
                {#each visibleStudents as student (student.ID)}
                    <tr>
                        <td><a href={`/students/${student.ID}`}>{student.fullName}</a></td>
                        <td>{student.ISU}</td>
                        <td>
                            {student.group}

                            <span class="foreign-icon">
                                {#if student.isForeign}
                                    <img src={earth} alt="Иностранный студент">
                                {/if}
                            </span>
                        </td>
                        {#if canEdit}
                            <td>
                                <a class="edit-link" href={`/students/${student.ID}/edit`}>Редактировать</a>
                            </td>
                        {/if}
                    </tr>
                {:else}
                    <tr>
                        <td colspan={canEdit ? 4 : 3}>
                            {#if students.length === 0}
                                Список студентов пуст
                            {:else}
                                По заданным условиям студентов нет
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- ! Table navigation down block ------------------------------------------- -->
    <p class="table-count">Показаны {totalStudents === 0 ? 0 : start + 1}–{Math.min(start + visibleCount, totalStudents)} из {totalStudents}</p>

    {#if start + visibleCount < totalStudents}
        <button type="button" class="move-button" onclick={(event) => {
            const step = event.shiftKey ? 5 : 1;
            const maxStart = Math.max(0, totalStudents - visibleCount);
            start = Math.min(start + step, maxStart);
            updateView();
        }}>↓</button>
    {/if}
</main> 


<style>
    main {
        margin: 12px auto 8px;
    }

    .page-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 8px;
    }

    .page-heading h1 {
        margin: 0;
        font-size: 32px;
    }

    .page-heading .primary-link, .changer-button, .search-field input {
        min-height: 32px;
        padding: 4px 10px;
    }

    .table-toolbar {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 8px;
    }

    .search-field {
        display: flex;
        align-items: center;
        gap: 10px;
        width: min(420px, 100%);
    }

    .changer-button, .move-button, .edit-link {
        color: var(--muted);
    }

    .changer-button {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-left: auto;
    }

    img {
        width: 18px;
        height: 18px;
        vertical-align: middle;
    }

    .changer-button img[src=''] {
        display: none;
    }

    .table-container {
        overflow-x: auto;
    }

    table {
        width: 100%;
        min-width: 620px;
        border-collapse: collapse;
    }

    td {
        height: clamp(24px, calc((100dvh - 290px) / 20), 42px);
        padding: 0 16px;
        border-bottom: 1px solid var(--border);
        font-size: 13px;
    }

    tr:last-child td {
        border-bottom: 0;
    }

    tr:hover td {
        background: #1c1c1c;
    }

    td:first-child {
        width: 44%;
    }

    td a {
        font-weight: 500;
        text-decoration: none;
    }

    td a:hover {
        text-decoration: underline;
    }

    td:nth-child(2), td:nth-child(3) {
        color: var(--muted);
        white-space: nowrap;
    }

    .foreign-icon {
        display: inline-block;
        width: 18px;
        margin-left: 8px;
        vertical-align: middle;
    }

    td:last-child {
        text-align: right;
    }

    .edit-link {
        display: inline-block;
        min-height: 22px;
        padding: 1px 6px;
        border: 1px solid transparent;
        font-size: 12px;
        line-height: 1.4;
    }

    .edit-link:hover {
        border-color: #626262;
        background: var(--surface-hover);
        text-decoration: none;
    }

    td[colspan] {
        height: 180px;
        color: var(--muted);
        text-align: center;
    }

    .move-button {
        width: 100%;
        min-height: 24px;
        margin: 4px 0;
        padding: 0 16px;
        font-size: 16px;
        line-height: 1;
    }

    .table-count {
        margin: 4px 0;
        font-size: 12px;
    }

    #changer {
        position: fixed;
        inset: 110px max(16px, calc((100vw - 1120px) / 2)) auto auto;
        width: min(360px, calc(100vw - 32px));
        max-height: min(480px, calc(100dvh - 140px));
        margin: 0;
        padding: 14px;
        overflow-y: auto;
        border-color: #535353;
        color: var(--text);
        box-shadow: 0 24px 80px #00000099;
    }

    .changer-tabs, .sort-order {
        display: flex;
        gap: 6px;
    }

    .changer-tabs button, .filter-div > button {
        min-height: 32px;
        padding: 6px 8px;
        font-size: 12px;
    }

    .changer-tabs button {
        flex: 1;
        color: var(--muted);
    }

    .changer-tabs .selected {
        border-color: var(--text);
        color: #111111;
        background: var(--text);
    }

    .filter-div {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-top: 14px;
    }

    .filter-div > div {
        display: grid;
        gap: 6px;
    }

    .filter-div input, .filter-div select {
        min-height: 32px;
        padding: 6px 8px;
        font-size: 12px;
    }

    .filter-div label {
        font-size: 12px;
    }

    .filter-div > button {
        grid-column: 1 / -1;
    }

    .sort-div {
        margin-top: 12px;
    }

    .sort-div > div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px solid var(--border);
    }

    .sort-div > div:last-child {
        padding-bottom: 0;
        border: 0;
    }

    .sort-field label {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text);
        font-size: 12px;
        cursor: pointer;
    }

    .sort-field input {
        width: 14px;
        height: 14px;
    }

    .sort-field span {
        display: block;
        margin-left: 20px;
        color: var(--muted);
        font-size: 11px;
    }

    .sort-order button {
        width: 44px;
        min-height: 28px;
        padding: 4px 6px;
        font-size: 11px;
    }

    .sort-order .selected {
        border-color: var(--text);
        background: #2b2b2b;
    }

    @media (max-width: 640px) {
        .page-heading {
            gap: 16px;
            margin-bottom: 12px;
        }

        td {
            padding: 0 10px;
        }

        #changer {
            inset: 24px 16px auto auto;
            max-height: min(480px, calc(100dvh - 48px));
        }

        .filter-div {
            grid-template-columns: 1fr;
        }
    }
</style>
