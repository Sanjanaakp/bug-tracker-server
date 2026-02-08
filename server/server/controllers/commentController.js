const Comment = require("../models/Comment");
const Ticket = require("../models/Ticket");


exports.createComment = async (req, res) => {
  try {
    const { ticketId, text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    
    if (ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the assigner can add comments." });
    }

    const comment = await Comment.create({
      ticket: ticketId,
      user: req.user._id,
      text
    });

    const populated = await comment.populate("user", "name");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getComments = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const loggedInUserId = req.user._id.toString();
    const creatorId = ticket.createdBy.toString();
    const assignedToId = ticket.assignedTo ? ticket.assignedTo.toString() : null;

    
    console.log(`Checking access for: ${loggedInUserId}`);
    console.log(`Creator: ${creatorId} | Assignee: ${assignedToId}`);

    const isCreator = creatorId === loggedInUserId;
    const isAssigned = assignedToId === loggedInUserId;

    if (!isCreator && !isAssigned) {
      return res.status(403).json({ 
        message: "Access Denied: You are not the assigner or the assignee of this ticket." 
      });
    }

    const comments = await Comment.find({ ticket: req.params.ticketId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};