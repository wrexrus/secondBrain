const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {
  saveWebsite,
  saveMedia,
  getCategories,
  getMetadata,
  searchWebsites,
  getWebsitesByCategory,
  deleteWebsite,
  updateWebsite
} = require("../controllers/websiteController");

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
router.post("/save", authMiddleware, saveWebsite);

// @route   POST /api/websites/save-media
// @desc    Save an image to disk and save website record
router.post("/save-media", authMiddleware, saveMedia);

// @route   GET /api/websites/categories
// @desc    Get all unique categories for the logged-in user
router.get("/categories", authMiddleware, getCategories);

// @route   GET /api/websites/metadata
// @desc    Get all categories and their respective sub-categories
router.get("/metadata", authMiddleware, getMetadata);

// @route   GET /api/websites/search?q=query
// @desc    Search all websites and categories for a user
router.get("/search", authMiddleware, searchWebsites);

// @route   GET /api/websites/:category
// @desc    Get all websites for a specific category
router.get("/:category", authMiddleware, getWebsitesByCategory);

// @route   DELETE /api/websites/:id
// @desc    Delete a specific website
router.delete("/:id", authMiddleware, deleteWebsite);

// @route   PUT /api/websites/:id
// @desc    Update a specific website
router.put("/:id", authMiddleware, updateWebsite);

module.exports = router;
