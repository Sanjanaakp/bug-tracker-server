const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getComments, createComment } = require("../controllers/commentController");

router.get("/:ticketId", protect, getComments);
router.post("/", protect, createComment);

module.exports = router;

