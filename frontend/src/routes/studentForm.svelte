<script>
    /** @typedef {import('#lib/studentTypes.js').Student} Student */
    /** @typedef {import('#lib/studentTypes.js').StudentInput} StudentInput */

    /**
     * @type {{
     *   student?: Student | null,
     *   onsave: (data: StudentInput) => void | Promise<void>,
     *   oncancel?: () => void
     * }}
     */
    let { student = null, onsave, oncancel = () => {} } = $props();

    let loading = $state(false);
    let message = $state('');

    /** @param {HTMLFormElement} form */
    function readStudent(form) {
        const fields = new FormData(form);
        const fullName = String(fields.get('fullName') ?? '').trim().replace(/\s+/g, ' ');
        const group = String(fields.get('group') ?? '').trim().toUpperCase();
        const ISU = String(fields.get('ISU') ?? '').trim();
        const dormNumber = String(fields.get('dormNumber') ?? '');
        const room = String(fields.get('room') ?? '');
        const dateArrived = String(fields.get('dateArrived') ?? '');

        const words = fullName.split(' ');
        if (words.length < 2 || words.some(word => word.length < 2)) {
            throw new Error('Укажите минимум два слова в ФИО, не короче двух символов каждое.');
        }
        if (!/^[A-Z][0-9]{4}$/.test(group)) {
            throw new Error('Группа должна содержать латинскую букву и четыре цифры, например P3223.');
        }
        if (!/^[0-9]{6}$/.test(ISU)) {
            throw new Error('Номер ИСУ должен содержать ровно шесть цифр.');
        }

        /** @type {StudentInput} */
        const data = {
            fullName,
            group,
            ISU,
            dormNumber: dormNumber === '' ? null : Number(dormNumber),
            room: room === '' ? null : Number(room),
            dateArrived: dateArrived === '' ? null : dateArrived,
            isForeign: fields.has('isForeign'),
            notes: String(fields.get('notes') ?? '')
        };

        for (const value of [data.dormNumber, data.room]) {
            if (value !== null && (!Number.isInteger(value) || value < 1 || value > 2147483647)) {
                throw new Error('Общежитие и комната должны быть положительными целыми числами.');
            }
        }
        if (data.dateArrived !== null && data.dormNumber === null) {
            throw new Error('Для даты заселения укажите номер общежития.');
        }
        if (data.room !== null && (data.dormNumber === null || data.dateArrived === null)) {
            throw new Error('Для комнаты укажите общежитие и дату заселения.');
        }

        return data;
    }

    /** @param {HTMLFormElement} form */
    async function submitForm(form) {
        if (loading) return;
        loading = true;
        message = '';

        try {
            const data = readStudent(form);
            await onsave(data);
        } catch (error) {
            message = error instanceof Error ? error.message : 'Не удалось сохранить студента.';
        } finally {
            loading = false;
        }
    }
</script>

<!-- ! Student form block ------------------------------------------- -->
<section class="student-form panel">
    <form onsubmit={(event) => {
        event.preventDefault();
        submitForm(event.currentTarget);
    }}>
        <fieldset disabled={loading}>
            <legend>Данные студента</legend>

            <div class="full-width">
                <label>
                    ФИО
                    <input name="fullName" value={student?.fullName ?? ''} required>
                </label>
            </div>

            <div>
                <label>
                    Группа
                    <input
                        name="group"
                        value={student?.group ?? ''}
                        pattern={'[A-Za-z][0-9]{4}'}
                        maxlength="5"
                        title="Латинская буква и четыре цифры, например P3223"
                        required
                    >
                </label>
            </div>

            <div>
                <label>
                    Номер ИСУ
                    <input
                        name="ISU"
                        value={student?.ISU ?? ''}
                        inputmode="numeric"
                        pattern={'[0-9]{6}'}
                        minlength="6"
                        maxlength="6"
                        title="Ровно шесть цифр"
                        required
                    >
                </label>
            </div>

            <div>
                <label>
                    Номер общежития
                    <input name="dormNumber" type="number" min="1" max="2147483647" step="1" value={student?.dormNumber ?? ''}>
                </label>
            </div>

            <div>
                <label>
                    Комната
                    <input name="room" type="number" min="1" max="2147483647" step="1" value={student?.room ?? ''}>
                </label>
            </div>

            <div>
                <label>
                    Дата заселения
                    <input name="dateArrived" type="date" value={student?.dateArrived ?? ''}>
                </label>
            </div>
            <div>
                <label class="checkbox-field">
                    <input name="isForeign" type="checkbox" checked={student?.isForeign ?? false}>
                    Иностранный студент
                </label>
            </div>

            <div class="full-width">
                <label>
                    Заметки
                    <textarea name="notes" rows="4" value={student?.notes ?? ''}></textarea>
                </label>
            </div>

            <div class="form-actions">
                <button class="primary-button" type="submit">{loading ? 'Сохранение…' : 'Сохранить'}</button>
                <button type="button" onclick={oncancel}>Отмена</button>
            </div>
        </fieldset>

        <p class="form-message">{message}</p>
    </form>
</section>


<style>
    .student-form {
        margin: 28px 0 36px;
        padding: 32px;
    }

    fieldset {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
        min-width: 0;
        margin: 0;
        padding: 0;
        border: 0;
    }

    legend {
        margin-bottom: 20px;
        padding: 0;
    }

    label {
        display: grid;
        gap: 8px;
    }

    .full-width, .form-actions {
        grid-column: 1 / -1;
    }

    .checkbox-field {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 100%;
        padding-top: 26px;
        color: var(--text);
        cursor: pointer;
    }

    .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 8px;
    }


    @media (max-width: 640px) {
        .student-form {
            padding: 24px 20px;
        }

        fieldset {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
        }

        .checkbox-field {
            padding-top: 0;
        }

        .form-actions button {
            flex: 1;
        }
    }
</style>
