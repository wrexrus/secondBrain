const express = require("express");
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.get("/",(req,res)=>{
    res.send("Backend running");
});

app.listen(5000,()=>{
    console.log("backend running!");
})