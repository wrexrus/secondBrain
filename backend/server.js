const express = require("express");
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const PORT = process.env.PORT || 5000;
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const websiteRoutes = require("./routes/websiteRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

dotenv.config();

const app = express();

const path = require("path");

// middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// db connection
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDb connected!");
})
.catch((err)=>{
    console.log(err);
})

// routes

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/websites", websiteRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/",(req,res)=>{
    res.send("Backend running!!");
});

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})