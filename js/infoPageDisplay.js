import {getStudentById} from "./storageOperations.js";
import {requireAuth, showSession} from "./auth.js";

const studentID = new URLSearchParams(location.search).get("id");
const infoBody = document.querySelector("#student-info");

async function loadStudent() {
    if (!requireAuth()) return;
    showSession();
    if (!studentID) {
        infoBody.textContent = "ID студента не указан";
        return;
    }
    try {
        const student = await getStudentById(studentID);
        const fields = [
            ["ФИО", student.fullName],
            ["Группа", student.group],
            ["ИСУ ID", student.ISU],
            ["Общежитие", student.dormNumber],
            ["Комната", student.room],
            ["Дата заселения", student.dateArrived],
            ["Иностранец", student.isForeign ? "Да" : "Нет"],
            ["Заметки", student.notes || "-"],
            ["ID", student.ID]
        ];
        infoBody.replaceChildren();
        for (const [label, value] of fields) {
            const paragraph = document.createElement("p");
            if (label === "Заметки") paragraph.id = "student-notes";
            const title = document.createElement("strong");
            title.textContent = `${label}: `;
            paragraph.append(title, document.createTextNode(value ?? "-"));
            infoBody.append(paragraph);
        }
    } catch (error) {
        infoBody.textContent = error.message;
    }
}

loadStudent();
