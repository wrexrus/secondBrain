const express = require("express");
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const PORT = process.env.PORT || 5000;
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

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

app.get("/",(req,res)=>{
    res.send("Backend running!!");
});

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})