const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

let db;
const client = new MongoClient("mongodb://localhost:27017");
client.connect()
    .then(() => {
        db = client.db("Student"); // Change database name to "ecommerce"
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.error("MongoDB Connection Failed:", err);
    });

// Get all students
app.get('/students', async (req, res) => {
    try {
        const students = await db.collection("Student").find().toArray(); // Use "Student" collection
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
});

// Get a specific student by ID
app.get('/findstudents/:search', async (req, res) => {
    const search = req.params.search?.toLowerCase();
    try {
        let query = {};
        if (search) {
            query = {
                $or: [
                    { "Student_id": { $regex: search, $options: 'i' } },
                    { "Name": { $regex: search, $options: 'i' } }
                ]
            };
        }
        const students = await db.collection("Student").find(query).toArray();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
});

// Add a new student
app.post('/students', async (req, res) => {
    try {
        const data = req.body;
        if (!data.Student_id) { // Validate fields for student
            return res.status(400).json({ error: "Name and Price are required" });
        }

        const student = await db.collection("Student").insertOne(data); // Use "Student" collection
        res.json({ message: "Student added successfully", student });
    } catch (err) {
        res.status(500).json({ error: "Failed to add student" });
    }
});

// Update a student by ID
app.put('/students/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;

        const student = await db.collection("Student").updateOne( // Use "Student" collection
            { "Student_id": id },
            { $set: data }
        );

        if (student.matchedCount === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json({ message: "Student updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update student" });
    }
});

// Delete a student by ID
app.delete('/students/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.collection("Student").deleteOne({ "Student_id": id }); // Use "Student" collection

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json({ message: "Student deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete student" });
    }
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
