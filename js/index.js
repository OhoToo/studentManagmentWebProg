import {getStudents, deleteStudent} from "./storageOperations.js";
import {renderTable} from "./displayOperations.js";
import {requireAuth, showSession, isAdmin} from "./auth.js";

const filterForm = document.querySelector("#filter-form");
const table = document.querySelector("#students-tbody");
const message = document.querySelector("#list-message");
const previousButton = document.querySelector("#previous-page");
const nextButton = document.querySelector("#next-page");
const pageLabel = document.querySelector("#page-number");
const applyButton = filterForm.querySelector('[type="submit"]');
const resetButton = document.querySelector("#reset-filter-button");
let page = 0;
let size = 10;
let filters = {};
let loading = false;
let hasNext = false;

async function loadStudents(requestedPage = 0) {
    if (loading) return;
    loading = true;
    message.textContent = "";
    previousButton.disabled = true;
    nextButton.disabled = true;
    applyButton.disabled = true;
    resetButton.disabled = true;
    try {
        let students = await getStudents(filters, requestedPage, size);
        if (students.length === 0 && requestedPage > page) {
            hasNext = false;
            return;
        }
        if (students.length === 0 && requestedPage > 0) {
            requestedPage--;
            students = await getStudents(filters, requestedPage, size);
        }
        page = requestedPage;
        hasNext = students.length === size;
        renderTable(table, students, isAdmin());
        pageLabel.textContent = `Страница ${page + 1}`;
    } catch (error) {
        message.textContent = error.message;
    } finally {
        loading = false;
        previousButton.disabled = page === 0;
        nextButton.disabled = !hasNext;
        applyButton.disabled = false;
        resetButton.disabled = false;
    }
}

filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    filters = {
        fullName: filterForm.elements.fullName.value.trim(),
        group: filterForm.elements.group.value.trim(),
        dormitory: filterForm.elements.dormitory.value,
        sort: filterForm.elements.sort.value,
        order: filterForm.elements.order.value
    };
    size = filterForm.elements.size.valueAsNumber;
    loadStudents(0);
});

resetButton.addEventListener("click", () => {
    filterForm.reset();
    filters = {};
    size = 10;
    loadStudents(0);
});

previousButton.addEventListener("click", () => loadStudents(page - 1));
nextButton.addEventListener("click", () => loadStudents(page + 1));

document.querySelector("#show-add-form-bin").addEventListener("click", () => {
    location.href = "/html/studentFormPage.html";
});

table.addEventListener("click", async (event) => {
    const row = event.target.closest("tr");
    if (!row || !isAdmin() || loading) return;

    if (event.target.classList.contains("btn-edit")) {
        location.href = `/html/studentFormPage.html?id=${encodeURIComponent(row.dataset.id)}`;
    }
    if (event.target.classList.contains("btn-delete")) {
        event.target.disabled = true;
        try {
            await deleteStudent(row.dataset.id);
            await loadStudents(page);
        } catch (error) {
            message.textContent = error.message;
        } finally {
            event.target.disabled = false;
        }
    }
});

if (requireAuth()) {
    showSession();
    document.querySelector("#add-student-panel").classList.toggle("hidden", !isAdmin());
    loadStudents();
}
