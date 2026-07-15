const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const PORT = process.env.PORT || 5000;
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const websiteRoutes = require("./routes/websiteRoutes");

const app = express();
const path = require("path");

const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const allowedOrigins = [
  process.env.FRONTEND_URL,    
  'http://localhost:5173'        
].filter(Boolean);

app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('chrome-extension://')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use("/api/", apiLimiter); // rate limiter to all /api routes

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDb connected!");
})
.catch((err)=>{
    console.log(err);
})


app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/websites", websiteRoutes);

app.get("/",(req,res)=>{
    res.send("Backend running!!");
});

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})