const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// @route   POST /api/feedback/submit
// @desc    Submit user feedback or suggestions
// @access  Public (so non-logged in users can suggest too)
router.post('/submit', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    const newFeedback = new Feedback({
      name,
      email,
      message
    });

    await newFeedback.save();
    res.status(201).json({ message: "Thank you for your suggestion!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error submitting feedback" });
  }
});

module.exports = router;
