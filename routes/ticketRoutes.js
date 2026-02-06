const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createTicket,
  getTicketsByProject,
  getSingleTicket,
  getMyTickets,
  updateTicketStatus,
  updateTicket,
  deleteTicket
} = require("../controllers/ticketController");

router.post("/", protect, createTicket);
router.get("/project/:projectId", protect, getTicketsByProject);
router.get("/my", protect, getMyTickets);
router.put("/:id/status", protect, updateTicketStatus);
router.put("/:id", protect, updateTicket);
router.delete("/:id", protect, deleteTicket);
router.get("/:id", protect, getSingleTicket);

module.exports = router;
