const apiUrl = "http://localhost:3000/students";

// 📌 Submit Form (Add/Edit)
async function submitForm(event) {
    event.preventDefault();

    const studentId = document.getElementById("studentId").value;
    const firstName = document.getElementById("firstName").value;
    const editingId = document.getElementById("editingId").value;

    if (editingId) {

        await fetch(`${apiUrl}/${editingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ Student_id: studentId, Name: firstName })
        });
        document.getElementById("editingId").value = "";
    } else {

        await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ Student_id: studentId, Name: firstName })
        });
    }

    document.getElementById("studentId").value = "";
    document.getElementById("firstName").value = "";
    fetchStudents();
}


async function searchStudents() {
    const query = document.getElementById("searchBox").value.trim().toLowerCase();
    if (query === "") {
        fetchStudents();
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/findstudents/${query}`);
        if (!res.ok) throw new Error("ไม่พบข้อมูล");
        const students = await res.json();
        renderStudents(students);
    } catch (error) {
        console.error("Error:", error);
    }
}



function renderStudents(students) {
    const list = document.getElementById("studentList");

    if (students.length === 0) {
        list.innerHTML = `<li>❌ ไม่พบข้อมูล</li>`;
        return;
    }

    list.innerHTML = students.map(student =>
        `<li>${student.Student_id} - ${student.Name}
        <button onclick="editStudent('${student._id}', '${student.Student_id}', '${student.Name}')">✏️ EDIT</button>
        <button onclick="deleteStudent('${student.Student_id}')">❌ DELETE</button>
        </li>`).join("");
}

async function fetchStudents() {
    const res = await fetch(apiUrl);
    const students = await res.json();
    renderStudents(students);
}

// 📌 ลบ
async function deleteStudent(id) {
    await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    fetchStudents();
}

// 📌 แก้ไข
function editStudent(id, studentId, firstName) {
    document.getElementById("studentId").value = studentId;
    document.getElementById("firstName").value = firstName;
}

fetchStudents();
