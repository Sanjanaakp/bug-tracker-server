const Project = require("../models/Project");
const Ticket = require("../models/Ticket");

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // --- USER WORKSPACE ---
    // Count projects where the user is a member
    const projects = await Project.countDocuments({
      members: userId
    });

    // Total tickets assigned to the user
    const tickets = await Ticket.countDocuments({
      assignedTo: userId
    });

    // Tickets assigned to the user that are NOT finished
    const pending = await Ticket.countDocuments({
      assignedTo: userId,
      status: { $ne: "Done" }
    });

    // Tickets assigned to the user that are completed
    const done = await Ticket.countDocuments({
      assignedTo: userId,
      status: "Done"
    });

    // --- KANBAN STATS (CARD SPECIFIC) ---
    // Specifically for the 'Todo' column card
    const open = await Ticket.countDocuments({ 
      assignedTo: userId, 
      status: "Todo" 
    });

    // Specifically for the 'In Progress' column card
    const progress = await Ticket.countDocuments({ 
      assignedTo: userId, 
      status: "In Progress" 
    });

    // Count of high-priority tasks for the 'High Priority' card
    const high = await Ticket.countDocuments({ 
      assignedTo: userId, 
      priority: "High" 
    });

    // Send all stats in a single JSON response
    res.json({
      projects,
      tickets,
      pending,
      done,
      open,
      progress,
      high
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};