const API_URL = "/api/requests";

async function getStudents(
    nameFilter = "",
    groupFilter = "",
    dormitoryFilter = ""
) {
    const filters = {
        fullName: nameFilter.trim(),
        group: groupFilter.trim(),
        dormitory: dormitoryFilter.trim()
    };

    const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) => value !== ""
        )
    );

    const filterCount = Object.keys(activeFilters).length;

    let response;

    if (filterCount <= 1) {
        const params = new URLSearchParams(activeFilters);
        const queryString = params.toString();

        const url = queryString
            ? `${API_URL}?${queryString}`
            : API_URL;

        response = await fetch(url);
    } else {
        response = await fetch(API_URL, {
            method: "QUERY",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(activeFilters)
        });
    }

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.error || `Ошибка HTTP: ${response.status}`
        );
    }

    return result;
}


async function getStudentById(studentID) {
    const response = await fetch(
        `${API_URL}/${encodeURIComponent(studentID)}`
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || `Ошибка HTTP: ${response.status}`);
    }

    return result;
}


async function addStudent(student) {
    const response = await fetch(API_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(student)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || `Ошибка HTTP: ${response.status}`);
    }

    return result;
}

async function updateStudent(studentID, student) {
    const response = await fetch(
        `${API_URL}/${encodeURIComponent(studentID)}`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(student)
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || `Ошибка HTTP: ${response.status}`);
    }

    return result;
}

async function deleteStudent(studentID) {
    const response = await fetch(
        `${API_URL}/${encodeURIComponent(studentID)}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        let result = {};

        try {
            result = await response.json();
        } catch {
            
        }

        throw new Error(
            result.error || `Ошибка HTTP: ${response.status}`
        );
    }

    return true;
}


export {
    getStudents,
    getStudentById,
    addStudent,
    updateStudent,
    deleteStudent
};