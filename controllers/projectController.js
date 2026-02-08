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

// ================= GET PROJECTS =================
exports.getProjects = async (req, res) => {
  try {
    // Finds all projects where the logged-in user's ID is in the members list
    const projects = await Project.find({
      members: req.user._id
    }).populate("owner", "name email");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE PROJECT (OWNER ONLY) =================
// ================= UPDATE PROJECT (OWNER ONLY) =================
// ================= UPDATE PROJECT (OWNER ONLY) =================
exports.updateProject = async (req, res) => {
  try {
    // 1. Find the project by ID from the URL parameters
    const project = await Project.findById(req.params.id);

    // 2. Return 404 if the project doesn't exist
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 3. Authorization check: Compare project owner with logged-in user
    // We convert ObjectIds to strings to ensure an accurate comparison.
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the project owner can edit these details" });
    }

    // 4. Update fields if provided in the request body, otherwise keep existing values
    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    
    // 5. Save the updated document to MongoDB
    await project.save();
    
    // 6. Return the updated project object
    res.json(project);
  } catch (err) {
    console.error("Project Update Error:", err);
    res.status(500).json({ message: "Server error while updating project" });
  }
};

// ================= DELETE PROJECT (OWNER ONLY) =================
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Authorization check: Only the owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }

    await project.deleteOne();
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE PROJECT (OWNER ONLY) =================
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Authorization check: Only the original creator (owner) can edit
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owners can edit projects" });
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    
    await project.save();
    res.json(project);
  } catch (err) {
    console.error("Project Update Error:", err);
    res.status(500).json({ message: err.message });
  }
};