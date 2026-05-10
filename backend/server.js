const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   RAZORPAY
========================= */
const razorpay = new Razorpay({
    key_id: "rzp_test_SnPvfwVU6uByz3",
    key_secret: "umEckd1Cz0TDq67DPBisiU7N"
});

/* =========================
   MONGODB CONNECTION
========================= */
mongoose.connect(
    "mongodb://admin:admin123@ac-vlxwyuv-shard-00-00.szhvgua.mongodb.net:27017,ac-vlxwyuv-shard-00-01.szhvgua.mongodb.net:27017,ac-vlxwyuv-shard-00-02.szhvgua.mongodb.net:27017/nexeducation?ssl=true&replicaSet=atlas-kl1j0t-shard-0&authSource=admin&appName=Cluster0"
)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* =========================
   STUDENT SCHEMA
========================= */
const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const Student = mongoose.model("Student", studentSchema);

/* =========================
   COURSE SCHEMA
========================= */
const courseSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    videoLink: String
});

const Course = mongoose.model("Course", courseSchema);

/* =========================
   PURCHASE SCHEMA
========================= */
const purchaseSchema = new mongoose.Schema({
    studentEmail: String,
    courseTitle: String,
    paymentId: String
});

const Purchase = mongoose.model("Purchase", purchaseSchema);

/* =========================
   HOME ROUTE
========================= */
app.get("/", (req, res) => {
    res.send("NexEducation Backend Running Successfully");
});

/* =========================
   REGISTER ROUTE
========================= */
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = new Student({
            name,
            email,
            password: hashedPassword
        });

        await newStudent.save();

        res.json({
            message: "Student Registered Successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Registration Failed"
        });
    }
});

/* =========================
   LOGIN ROUTE
========================= */
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const student = await Student.findOne({ email });

        if (!student) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        const isMatch = await bcrypt.compare(password, student.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect Password"
            });
        }

        res.json({
            message: "Login Successful"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Login Failed"
        });
    }
});

/* =========================
   ADD COURSE ROUTE
========================= */
app.post("/add-course", async (req, res) => {
    try {
        const { title, description, price, videoLink } = req.body;

        const newCourse = new Course({
            title,
            description,
            price,
            videoLink
        });

        await newCourse.save();

        res.json({
            message: "Course Added Successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Course Upload Failed"
        });
    }
});

/* =========================
   GET COURSES ROUTE
========================= */
app.get("/courses", async (req, res) => {
    try {
        const courses = await Course.find();

        res.json(courses);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch courses"
        });
    }
});

/* =========================
   GET STUDENTS ROUTE
========================= */
app.get("/students", async (req, res) => {
    try {
        const students = await Student.find();

        res.json(students);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch students"
        });
    }
});

/* =========================
   CREATE ORDER ROUTE
========================= */
app.post("/create-order", async (req, res) => {
    try {
        const options = {
            amount: 50000,
            currency: "INR",
            receipt: "course_order"
        };

        const order = await razorpay.orders.create(options);

        res.json(order);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Payment Failed"
        });
    }
});

/* =========================
   SAVE PURCHASE ROUTE
========================= */
app.post("/save-purchase", async (req, res) => {
    try {
        const { studentEmail, courseTitle, paymentId } = req.body;

        const newPurchase = new Purchase({
            studentEmail,
            courseTitle,
            paymentId
        });

        await newPurchase.save();

        res.json({
            message: "Purchase Saved Successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to save purchase"
        });
    }
});

/* =========================
   SERVER START
========================= */
app.get("/my-courses/:email", async (req, res) => {
    try {
        const email = req.params.email;

        const purchases = await Purchase.find({
            studentEmail: email
        });

        res.json(purchases);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch purchased courses"
        });
    }
});
app.get("/admin-stats", async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalPurchases = await Purchase.countDocuments();

        res.json({
            totalStudents,
            totalCourses,
            totalPurchases
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch admin stats"
        });
    }
});
app.listen(5000, () => {
    console.log("Server running on port 5000");
});