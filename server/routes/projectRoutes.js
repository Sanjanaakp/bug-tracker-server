const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createProject,
  getProjects,
  deleteProject
} = require("../controllers/projectController");

router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.delete("/:id", protect, deleteProject);

module.exports = router;
