



function saveToLocalStorage(list, name="students") {
    localStorage.setItem(name, JSON.stringify(list));
}


function addStudentToLocalStorage(student) {
    const students = JSON.parse(localStorage.getItem("students"));

    students.unshift(student);

    saveToLocalStorage(students);
}


function deleteStudentFromLocalStorage(studentID) {
    const students = JSON.parse(localStorage.getItem("students"));

    students.splice(students.findIndex((student) => student.ID === studentID),1);

    saveToLocalStorage(students);
}

export { saveToLocalStorage, addStudentToLocalStorage, deleteStudentFromLocalStorage }