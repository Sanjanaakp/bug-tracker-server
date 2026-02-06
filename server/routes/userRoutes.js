const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Import all functions from the controller
const { 
  registerUser, 
  authUser, 
  updateProfile,
  // Ensure these names match what you exported in your controller
  getMe, 
  getAllUsers 
} = require("../controllers/userController");

// --- AUTH ROUTES ---
// router.post("/login", authUser);
// router.post("/register", registerUser);

// --- PROFILE ROUTES ---

// ✅ Update Name and Password
router.put("/profile", protect, updateProfile);

// ✅ Logged-in user profile
router.get("/me", protect, getMe);

// ✅ Get ALL users (for project members / ticket assign)
router.get("/", protect, getAllUsers);

module.exports = router;