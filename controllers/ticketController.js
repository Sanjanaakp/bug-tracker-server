const Ticket = require("../models/Ticket");
const Project = require("../models/Project");

// Helper to check project membership
const isMember = (project, userId) =>
  project.members.some(m => m.toString() === userId.toString());

// ================= CREATE =================
const createTicket = async (req, res) => {
  try {
    const { title, description, priority, projectId, assignedTo } = req.body;
    if (!title || !projectId) return res.status(400).json({ message: "Title and project required" });

    const project = await Project.findById(projectId);
    if (!project || !isMember(project, req.user._id))
      return res.status(403).json({ message: "Not authorized" });

    let ticket = await Ticket.create({
      title, description, priority: priority || "Medium",
      status: "Todo", project: projectId,
      createdBy: req.user._id, assignedTo: assignedTo || req.user._id 
    });
    res.status(201).json(ticket);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================= SINGLE TICKET =================
const getSingleTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================= PROJECT TICKETS =================
const getTicketsByProject = async (req, res) => {
  try {
    const tickets = await Ticket.find({ project: req.params.projectId })
      .populate("createdBy", "name").populate("assignedTo", "name");
    res.json(tickets);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================= STATUS =================
const updateTicketStatus = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    ticket.status = req.body.status;
    await ticket.save();
    res.json(ticket);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================= UPDATE (The missing function) =================
const updateTicket = async (req, res) => {
  try {
    let ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const isCreator = ticket.createdBy.toString() === req.user._id.toString();
    const isAssigned = ticket.assignedTo?.toString() === req.user._id.toString();

    if (!isCreator && !isAssigned)
      return res.status(403).json({ message: "Only creator or assignee can edit" });

    ticket.title = req.body.title || ticket.title;
    ticket.description = req.body.description || ticket.description;
    ticket.priority = req.body.priority || ticket.priority;

    await ticket.save();
    res.json(ticket);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================= DELETE =================
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const isCreator = ticket.createdBy.toString() === req.user._id.toString();
    if (!isCreator)
      return res.status(403).json({ message: "Only the creator can delete" });

    await ticket.deleteOne();
    res.json({ message: "Ticket deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================= MY TICKETS =================
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: req.user._id })
    .populate("project", "name").populate("createdBy", "name").sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};

// Exporting all functions (Now updateTicket is defined!)
module.exports = {
  createTicket,
  getTicketsByProject,
  getSingleTicket,
  getMyTickets,
  updateTicketStatus,
  updateTicket,
  deleteTicket
};