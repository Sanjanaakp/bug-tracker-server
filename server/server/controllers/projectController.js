const Project = require("../models/Project");

// ================= CREATE PROJECT =================
exports.createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    // Ensure the owner is also part of the members array
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [...(members || []), req.user._id] 
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("Project Creation Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET PROJECTS (FOR WORKSPACE) =================
exports.getProjects = async (req, res) => {
  try {
    // Finds all projects where the logged-in user's ID is in the members list
    // Populates owner details to display on the dashboard if needed
    const projects = await Project.find({
      members: req.user._id
    }).populate("owner", "name email");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE PROJECT (OWNER ONLY) =================
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Authorization check: Only the original creator (owner) can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }

    await project.deleteOne();
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};