import { deleteStudentFromLocalStorage } from "./localStorageOperations.js";
import { renderTable } from "./displayOperations.js";

//! initialase (Я хз как пишется) LS

if (localStorage.getItem("students") === null) {
    localStorage.setItem("students", JSON.stringify([]));
}

//!gotocreateStudent------------------------------------------------
const butt = document.querySelector("#show-add-form-bin")

butt.addEventListener("click", () => {
    location.href = "studentFormPage.html"
})

const students = JSON.parse(localStorage.getItem("students"))


//!DisplayTable
renderTable();

//! button's work

const table = document.querySelector("tbody");
table.addEventListener("click", (event) => {
    if(event.target.textContent === "Удалить") {
        deleteStudentFromLocalStorage(event.target.closest("tr").dataset.id)
    }
    //todo Make about update
    if(event.target.textContent === "Изменить") {
        location.href = `../html/studentFormPage.html?id=${event.target.closest("tr").dataset.id}`;
    }
    renderTable();
})










