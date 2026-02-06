const Ticket = require("../models/Ticket");
const Project = require("../models/Project");

// Helper to check project membership
const isMember = (project, userId) =>
 project.members.some(m => m.toString() === userId.toString());

// ================= CREATE =================
const createTicket = async (req, res) => {
 try {
  const { title, description, priority, projectId, assignedTo } = req.body;

  if (!title || !projectId)
   return res.status(400).json({ message: "Title and project required" });

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  if (!isMember(project, req.user._id))
   return res.status(403).json({ message: "Not project member" });

  // ✅ LOGIC: If 'assignedTo' isn't sent in the request, default to the creator
  let ticket = await Ticket.create({
   title,
   description,
   priority: priority || "Medium",
   status: "Todo",
   project: projectId,
   createdBy: req.user._id,
   assignedTo: assignedTo || req.user._id // 👈 This ensures it shows on the Kanban Dashboard
  });

  res.status(201).json(ticket);

 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// ================= SINGLE TICKET =================
const getSingleTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= PROJECT TICKETS =================
const getTicketsByProject = async (req, res) => {
 try {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  if (!isMember(project, req.user._id))
   return res.status(403).json({ message: "Not project member" });

  const tickets = await Ticket.find({ project: req.params.projectId })
   .populate("createdBy","name")
   .populate("assignedTo","name");

  res.json(tickets);

 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// ================= STATUS =================
const updateTicketStatus = async (req, res) => {
 try {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket)
   return res.status(404).json({ message: "Ticket not found" });

  // Only the person assigned can move the ticket through the Kanban columns
  if (ticket.assignedTo.toString() !== req.user._id.toString())
   return res.status(403).json({ message: "Only assigned user can change status" });

  const allowed = ["Todo","In Progress","Done"];
  if(!allowed.includes(req.body.status))
   return res.status(400).json({message:"Invalid status"});

  ticket.status=req.body.status;
  await ticket.save();

  res.json(ticket);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// ================= MY TICKETS (KANBAN FEED) =================
// server/controllers/ticketController.js

// server/controllers/ticketController.js

const getMyTickets = async (req, res) => {
  try {
    // 🛑 DEBUG: Log the ID being used for the search
    console.log("Fetching tickets for User ID:", req.user._id);

    // ✅ STRICT FILTER: Search only where 'assignedTo' matches the logged-in user's ID
    const tickets = await Ticket.find({ 
      assignedTo: req.user._id 
    })
    .populate("project", "name")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });

    // 🛑 DEBUG: Log the results
    console.log(`Backend found ${tickets.length} tickets assigned to this user.`);

    res.json(tickets);
  } catch (err) {
    console.error("Dashboard Fetch Error:", err);
    res.status(500).json({ message: "Server error while fetching tasks." });
  }
};

// ================= UPDATE =================
const updateTicket = async (req, res) => {
 try {
  let ticket = await Ticket.findById(req.params.id);

  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  const isCreator = ticket.createdBy.toString() === req.user._id.toString();
  const isAssigned = ticket.assignedTo.toString() === req.user._id.toString();

  if (!isCreator && !isAssigned)
   return res.status(403).json({ message: "Not authorized" });

  ticket.title=req.body.title||ticket.title;
  ticket.description=req.body.description||ticket.description;
  ticket.priority=req.body.priority||ticket.priority;

  await ticket.save();
  res.json(ticket);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// ================= DELETE =================
const deleteTicket = async (req, res) => {
 try {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  const isCreator = ticket.createdBy.toString() === req.user._id.toString();
  if (!isCreator)
   return res.status(403).json({ message: "Not authorized to delete" });

  await ticket.deleteOne();
  res.json({ message: "Ticket deleted" });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// Exporting all functions for the router
module.exports = {
 createTicket,
 getTicketsByProject,
 getSingleTicket,
 getMyTickets,
 updateTicketStatus,
 updateTicket,
 deleteTicket
};