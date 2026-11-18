import {apiRequest} from "./auth.js";

const API_URL = "/api/requests";

function getStudents(filters = {}, page = 0, size = 10) {
    const params = new URLSearchParams({page, size});
    for (const name of ["fullName", "group", "dormitory", "sort", "order"]) {
        if (filters[name]) params.set(name, filters[name]);
    }
    return apiRequest(`${API_URL}?${params}`);
}

function getStudentById(studentID) {
    return apiRequest(`${API_URL}/${encodeURIComponent(studentID)}`);
}

function addStudent(student) {
    return apiRequest(API_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(student)
    });
}

function updateStudent(studentID, student) {
    return apiRequest(`${API_URL}/${encodeURIComponent(studentID)}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(student)
    });
}

function deleteStudent(studentID) {
    return apiRequest(`${API_URL}/${encodeURIComponent(studentID)}`, {method: "DELETE"});
}

export {getStudents, getStudentById, addStudent, updateStudent, deleteStudent};
