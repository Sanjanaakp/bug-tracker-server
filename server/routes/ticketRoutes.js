const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  createTicket,
  getTicketsByProject,
  updateTicketStatus,
  assignTicket,
  updateTicket,
  deleteTicket
} = require('../controllers/ticketController');

router.post('/', protect, createTicket);
router.get('/:projectId', protect, getTicketsByProject);
router.put('/:id/status', protect, updateTicketStatus);
router.put('/:id/assign', protect, assignTicket);
router.put('/:id', protect, updateTicket);
router.delete('/:id', protect, deleteTicket);

module.exports = router;
