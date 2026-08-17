const Website = require("../models/Website");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { indexItem, deleteChunksForItem } = require('../services/embeddingService');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const saveWebsite = async (req, res) => {
  try {
    const { url, category, content, subCategory, type, aiEnabled } = req.body;
    
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
    // Don't auto-fetch title if it's a video, the extension will handle it better or we just leave it
    if (!finalContent && url && type !== 'video') {
      try {
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

    const isStub = !url && !finalContent;

    const newWebsite = new Website({
      user: req.user.id,
      url,
      category: finalCategory,
      subCategory: finalSubCategory,
      content: finalContent,
      type: type || 'website',
      aiEnabled: aiEnabled === true,   // strictly coerce — only true if explicitly passed as true
      isStub
    });

    const savedWebsite = await newWebsite.save();
    res.status(201).json(savedWebsite);

    // Fire-and-forget: only index if user opted in AND there is text content.
    // Not awaited — the HTTP response is already sent above.
    if (aiEnabled === true && finalContent) {
      indexItem(savedWebsite._id.toString(), req.user.id, finalContent);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error saving website" });
  }
};

const saveMedia = async (req, res) => {
  try {
    const { url, category, content, subCategory, image, aiEnabled } = req.body;
    
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

    let imagePath = null;
    if (image) {
      try {
        const result = await cloudinary.uploader.upload(image, {
          folder: "synapse_thumbnails"
        });
        imagePath = result.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
      }
    }

    const isStub = !url && !content && !imagePath;

    const newWebsite = new Website({
      user: req.user.id,
      url: url || "",
      category: finalCategory,
      subCategory: finalSubCategory,
      content: content || "",
      imagePath: imagePath,
      aiEnabled: aiEnabled === true,
      isStub
    });

    const savedWebsite = await newWebsite.save();
    res.status(201).json(savedWebsite);

    // Fire-and-forget: index the text content if AI opted in
    if (aiEnabled === true && content) {
      indexItem(savedWebsite._id.toString(), req.user.id, content);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error saving media" });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Website.distinct("category", { user: req.user.id });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching categories" });
  }
};

const getMetadata = async (req, res) => {
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

    res.json({ metadata: metadataArray, totalCount: websites.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching metadata" });
  }
};

const searchWebsites = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.json([]);
    }

    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    };
    
    // Use \b to ensure it matches the START of a word, not anywhere inside the word
    const regex = new RegExp("\\b" + escapeRegExp(query), "i");

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
};

const getWebsitesByCategory = async (req, res) => {
  try {
    const websites = await Website.find({ 
      user: req.user.id, 
      category: { $regex: new RegExp("^" + req.params.category + "$", "i") },
      isStub: { $ne: true }
    }).sort({ createdAt: -1 });

    res.json(websites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching websites" });
  }
};

const deleteWebsite = async (req, res) => {
  try {
    const website = await Website.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!website) {
      return res.status(404).json({ message: "Website not found or not authorized" });
    }
    
    // If that was the very last item in the category, create a stub so the category doesn't vanish
    const count = await Website.countDocuments({ user: req.user.id, category: website.category });
    if (count === 0) {
      await Website.create({ user: req.user.id, category: website.category, isStub: true });
    }

    res.json({ message: "Website removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting website" });
  }
};

const updateWebsite = async (req, res) => {
  try {
    const { url, category, subCategory, content, image, aiEnabled } = req.body;
    let updateFields = { url, content };

    // Persist aiEnabled when it is explicitly sent in the request
    if (typeof aiEnabled === 'boolean') {
      updateFields.aiEnabled = aiEnabled;
    }

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

    if (image) {
      try {
        const result = await cloudinary.uploader.upload(image, {
          folder: "synapse_thumbnails"
        });
        updateFields.imagePath = result.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
      }
    }

    const website = await Website.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!website) {
      return res.status(404).json({ message: "Website not found or not authorized" });
    }
    res.json(website);

    // Fire-and-forget AI indexing AFTER response is sent
    if (typeof aiEnabled === 'boolean') {
      if (aiEnabled === false) {
        // User opted OUT — immediately delete any existing chunks for privacy
        deleteChunksForItem(website._id.toString());
      } else if (aiEnabled === true && updateFields.content) {
        // User opted IN or content changed while opted in — re-index
        indexItem(website._id.toString(), req.user.id, updateFields.content);
      }
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating website" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const result = await Website.deleteMany({ 
      user: req.user.id, 
      category: { $regex: new RegExp("^" + category + "$", "i") }
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Category not found or already empty" });
    }
    
    res.json({ message: "Category and all its contents deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting category" });
  }
};

module.exports = {
  saveWebsite,
  saveMedia,
  getCategories,
  getMetadata,
  searchWebsites,
  getWebsitesByCategory,
  deleteWebsite,
  updateWebsite,
  deleteCategory
};
