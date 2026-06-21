const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Website = require("../models/Website");

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// @route   POST /api/websites/save
// @desc    Save a new website
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const { url, category, content } = req.body;
    
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const formattedCategory = category.trim();
    const finalCategory = formattedCategory.charAt(0).toUpperCase() + formattedCategory.slice(1).toLowerCase();

    const newWebsite = new Website({
      user: req.user.id,
      url,
      category: finalCategory,
      content
    });

    const savedWebsite = await newWebsite.save();
    res.status(201).json(savedWebsite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error saving website" });
  }
});

// @route   GET /api/websites/categories
// @desc    Get all unique categories for the logged-in user
router.get("/categories", authMiddleware, async (req, res) => {
  try {
    // Get unique categories for this user
    const categories = await Website.distinct("category", { user: req.user.id });
    
    // We can also attach the count or just return the strings. 
    // Distinct returns an array of strings: ["Work", "Inspiration", ...]
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching categories" });
  }
});

// @route   GET /api/websites/:category
// @desc    Get all websites for a specific category
router.get("/:category", authMiddleware, async (req, res) => {
  try {
    // case-insensitive search just in case
    const websites = await Website.find({ 
      user: req.user.id, 
      category: { $regex: new RegExp("^" + req.params.category + "$", "i") }
    }).sort({ createdAt: -1 });

    res.json(websites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching websites" });
  }
});

// @route   DELETE /api/websites/:id
// @desc    Delete a specific website
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!website) {
      return res.status(404).json({ message: "Website not found or not authorized" });
    }
    res.json({ message: "Website removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting website" });
  }
});

module.exports = router;
