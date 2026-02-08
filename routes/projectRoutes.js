const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createProject,
  getProjects,
  deleteProject,
  updateProject // Successfully imported
} = require("../controllers/projectController");

// API Endpoints
router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.delete("/:id", protect, deleteProject);
router.put("/:id", protect, updateProject); // Registered PUT route for edits

module.exports = router;