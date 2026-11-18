function renderTable(table, students, canEdit) {
    table.replaceChildren();

    if (students.length === 0) {
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4;
        cell.textContent = "Студенты не найдены";
        return;
    }

    for (const student of students) {
        const row = table.insertRow();
        row.dataset.id = student.ID;

        const link = document.createElement("a");
        link.href = `/html/infoPage.html?id=${encodeURIComponent(student.ID)}`;
        link.textContent = student.fullName;
        row.insertCell().append(link);
        row.insertCell().textContent = student.group;
        row.insertCell().textContent = student.ISU;

        const actions = row.insertCell();
        if (canEdit) {
            const edit = document.createElement("button");
            edit.type = "button";
            edit.className = "btn-edit";
            edit.textContent = "Изменить";

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "btn-delete";
            remove.textContent = "Удалить";

            actions.append(edit, document.createTextNode(" "), remove);
        } else {
            actions.textContent = "Только просмотр";
        }
    }
}

export {renderTable};
