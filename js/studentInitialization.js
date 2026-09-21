


function validateStudentForm(student, students = JSON.parse(localStorage.getItem("students"))) {
    //! error
    let errorName = "";
    const names = student.fullName.trim().split(/\s+/);

    if(student.fullName.trim() === "" || names.some((word) => word.length < 2) || names.length < 2) {
        errorName += "fullname ";
    }

    const regex = /^[A-Za-z]\d{4}$/;
    if(!regex.test(student.group)) {
        errorName += "group ";
    }

    if(!/^[0-9]{6}$/.test(student.ISU) || students.some((readyStudent) => readyStudent.ISU === student.ISU && readyStudent.ID !== student.ID)) {
        errorName += "ISU ";
    }

    if(errorName.length > 0) {
        throw new Error(errorName + "error");
    }
    //! empty cells
    if(String(student.dormNumber).trim() === "") {
        student.dormNumber = null;
    }
    if (String(student.dateArrived ?? "").trim() === "" || student.dormNumber === null) {
        student.dateArrived = null;
        student.room = null;
    }
}

function createStudent(fullName, group, ISU, dormNumber, stuRoom, dateArrived, isForeign, notes, id=null) {
    const student = {
        "fullName" : fullName,
        "group" : group,
        "ISU" : ISU,
        "dormNumber" : dormNumber,
        "room" : stuRoom,
        "dateArrived" : dateArrived,
        "isForeign" : isForeign,
        "notes" : notes,
    }
    student.ID = id ?? crypto.randomUUID();
    //!errors
    validateStudentForm(student);

    let names = student.fullName.trim().split(/\s+/);
    for(let i = 0; i < names.length; i++) {
        names[i] = names[i][0].toUpperCase() + names[i].slice(1).toLowerCase();
    }
    student.group = student.group[0].toUpperCase() + student.group.slice(1);
    student.fullName = names.join(" ")

    

    return student;
}

export { createStudent }