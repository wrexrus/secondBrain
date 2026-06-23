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
    const { url, category, content, subCategory } = req.body;
    
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const formattedCategory = category.trim();
    const finalCategory = formattedCategory.charAt(0).toUpperCase() + formattedCategory.slice(1).toLowerCase();

    let finalSubCategory = "";
    if (subCategory && subCategory.trim().length > 0) {
      const formattedSub = subCategory.trim();
      finalSubCategory = formattedSub.charAt(0).toUpperCase() + formattedSub.slice(1).toLowerCase();
    }

    let finalContent = content;
    if (!finalContent && url) {
      try {
        // Simple title scraping using fetch (Node 18+)
        const fetchRes = await fetch(url, { signal: AbortSignal.timeout(3000) });
        const html = await fetchRes.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          finalContent = titleMatch[1].trim();
        }
      } catch (err) {
        console.log("Could not fetch title for url:", url);
      }
    }

    const newWebsite = new Website({
      user: req.user.id,
      url,
      category: finalCategory,
      subCategory: finalSubCategory,
      content: finalContent
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

// @route   GET /api/websites/metadata
// @desc    Get all categories and their respective sub-categories
router.get("/metadata", authMiddleware, async (req, res) => {
  try {
    const websites = await Website.find({ user: req.user.id }, 'category subCategory');
    const metadataMap = {};

    websites.forEach(site => {
      if (!metadataMap[site.category]) {
        metadataMap[site.category] = new Set();
      }
      if (site.subCategory && site.subCategory.trim().length > 0) {
        metadataMap[site.category].add(site.subCategory);
      }
    });

    const metadataArray = Object.keys(metadataMap).map(category => ({
      category,
      subCategories: Array.from(metadataMap[category])
    }));

    res.json(metadataArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching metadata" });
  }
});

// @route   GET /api/websites/search?q=query
// @desc    Search all websites and categories for a user
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.json([]);
    }

    const regex = new RegExp(query, "i");

    // Search where URL, category, or content matches the query
    const websites = await Website.find({
      user: req.user.id,
      $or: [
        { url: { $regex: regex } },
        { category: { $regex: regex } },
        { subCategory: { $regex: regex } },
        { content: { $regex: regex } }
      ]
    }).sort({ createdAt: -1 });

    res.json(websites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during search" });
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

// @route   PUT /api/websites/:id
// @desc    Update a specific website
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { url, category, subCategory, content } = req.body;
    let updateFields = { url, content };

    if (category) {
      updateFields.category = category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase();
    }
    if (subCategory !== undefined) {
      if (subCategory.trim().length > 0) {
        updateFields.subCategory = subCategory.trim().charAt(0).toUpperCase() + subCategory.trim().slice(1).toLowerCase();
      } else {
        updateFields.subCategory = "";
      }
    }

    const website = await Website.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: updateFields },
      { new: true }
    );

    if (!website) {
      return res.status(404).json({ message: "Website not found or not authorized" });
    }
    res.json(website);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating website" });
  }
});

module.exports = router;
