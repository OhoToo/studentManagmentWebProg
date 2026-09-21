import { saveToLocalStorage, addStudentToLocalStorage } from "./localStorageOperations.js";
import { createStudent  } from "./studentInitialization.js";


const sendButton = document.querySelector("#student-form");

//!create new student Processing--------------------------------------------

if(location.search === "") {
    sendButton.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(sendButton);


        //! check errorBlock
        const errorBlock = document.querySelector(".error-message");
        if(errorBlock !== null) {
            errorBlock.remove();
        }

        try {
            const student = createStudent(
                formData.get("stu-name"),
                formData.get("stu-group"),
                formData.get("stu-isu"),
                formData.get("stu-hostel"),
                formData.get("stu-room"),
                formData.get("stu-date"),
                formData.has("stu-foreign"),
                formData.get("stu-notes")
            );
            //! save Student
            
            addStudentToLocalStorage(student);

            //!goto index
            location.href = "index.html"
        } catch(error) {
            console.log(error.name)
            const attention = document.createElement("p");
            attention.classList.add("error-message")
            attention.style.color = "red";
            attention.textContent = error.message;

            const formBlock = document.querySelector("#form-section");

            formBlock.prepend(attention);
        } 

        
    })
}


//! Update student processing---------------------------------------------

else {
    //!Insert
    const inputs = sendButton.querySelectorAll('input:not([type="checkbox"]), textarea');
    const studentID = new URLSearchParams(location.search).get("id");
    const students = JSON.parse(localStorage.getItem("students"));
    const student = students.find((student) => student.ID === studentID);
    const studentNum = students.findIndex((student) => student.ID === studentID)
    const stuAtr = [student.fullName, student.group, student.ISU, student.dormNumber, student.room, student.dateArrived, student.notes]



    for(let i = 0; i < inputs.length; i++) {
        inputs[i].value = stuAtr[i];
    }
    const checkbox = sendButton.querySelector("#stu-foreign");
    checkbox.checked = student.isForeign;


    //! Sendform
    sendButton.addEventListener("submit", (event) => {
        event.preventDefault();


        const formData = new FormData(sendButton);

        //! check errorBlock
        const errorBlock = document.querySelector(".error-message");
        if(errorBlock !== null) {
            errorBlock.remove();
        }


        try {
            const updatedStudent = createStudent(
                formData.get("stu-name"),
                formData.get("stu-group"),
                formData.get("stu-isu"),
                formData.get("stu-hostel"),
                formData.get("stu-room"),
                formData.get("stu-date"),
                formData.has("stu-foreign"),
                formData.get("stu-notes"),
                student.ID
            );

            students[studentNum] = updatedStudent;
            saveToLocalStorage(students)

            location.href = "index.html"
        } catch(error) {
            console.log(error.name)
            const attention = document.createElement("p");
            attention.classList.add("error-message")
            attention.style.color = "red";
            attention.textContent = error.message;

            const formBlock = document.querySelector("#form-section");

            formBlock.prepend(attention);
        }
    })
}

