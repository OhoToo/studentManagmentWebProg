import {getStudentById, addStudent, updateStudent} from "./storageOperations.js";
import {createStudent} from "./studentInitialization.js";
import {requireAuth, showSession} from "./auth.js";

const form = document.querySelector("#student-form");
const saveButton = document.querySelector("#save-btn");
const studentID = new URLSearchParams(location.search).get("id");
const message = document.createElement("p");
message.className = "error-message";
message.setAttribute("role", "alert");
document.querySelector("#form-section").prepend(message);

async function init() {
    if (!requireAuth(true)) return;
    showSession();
    if (studentID) {
        try {
            const student = await getStudentById(studentID);
            form.elements["stu-name"].value = student.fullName;
            form.elements["stu-group"].value = student.group;
            form.elements["stu-isu"].value = student.ISU;
            form.elements["stu-hostel"].value = student.dormNumber ?? "";
            form.elements["stu-room"].value = student.room ?? "";
            form.elements["stu-date"].value = student.dateArrived ?? "";
            form.elements["stu-foreign"].checked = student.isForeign;
            form.elements["stu-notes"].value = student.notes;
            document.querySelector("#form-title").textContent = "Редактирование студента";
        } catch (error) {
            message.textContent = error.message;
            return;
        }
    }
    saveButton.disabled = false;
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        saveButton.disabled = true;
        message.textContent = "";
        try {
            const student = createStudent(
                form.elements["stu-name"].value,
                form.elements["stu-group"].value,
                form.elements["stu-isu"].value,
                form.elements["stu-hostel"].value,
                form.elements["stu-room"].value,
                form.elements["stu-date"].value,
                form.elements["stu-foreign"].checked,
                form.elements["stu-notes"].value
            );
            if (studentID) {
                await updateStudent(studentID, student);
            } else {
                await addStudent(student);
            }
            location.href = "/";
        } catch (error) {
            message.textContent = error.message;
        } finally {
            saveButton.disabled = false;
        }
    });
}

init();
