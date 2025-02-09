const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://127.0.0.1:27017/studentsDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true }, // รหัสนักศึกษา
  firstName: { type: String, required: true }, // ชื่อจริง
  lastName: { type: String, required: true } // นามสกุล
});

const Student = mongoose.model("Student", StudentSchema);

app.get("/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.get("/students/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "กรุณาป้อนข้อมูลที่ต้องการค้นหา" });
  }

  const students = await Student.find({
    $or: [
      { studentId: query },
      { firstName: { $regex: query, $options: "i" } },
      { lastName: { $regex: query, $options: "i" } },
      { $expr: { $regexMatch: { input: { $concat: ["$firstName", " ", "$lastName"] }, regex: query, options: "i" } } }
    ]
  });

  res.json(students);
});


app.post("/students", async (req, res) => {
  try {
    const { studentId, firstName, lastName } = req.body;

    if (!studentId || !firstName || !lastName) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ error: "รหัสนักศึกษานี้มีอยู่ในระบบแล้ว" });
    }

    const newStudent = new Student({ studentId, firstName, lastName });
    await newStudent.save();
    res.json({ message: "เพิ่มข้อมูลสำเร็จ!", student: newStudent });

  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล" });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStudent = await Student.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedStudent) {
      return res.status(404).json({ error: "ไม่พบข้อมูลนักศึกษา" });
    }

    res.json({ message: "อัปเดตข้อมูลสำเร็จ!", student: updatedStudent });

  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
  }
});

app.delete("/students/:id", async (req, res) => {
  const { id } = req.params;
  await Student.findByIdAndDelete(id);
  res.json({ message: "ลบข้อมูลสำเร็จ!" });
});

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
