const Project = require("../models/Project");


// Create Project
exports.createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id] // owner automatically added
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};


// Get All Projects for Logged-in User
exports.getMyProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      members: req.user._id
    }).populate("owner", "name email");

    res.json(projects);
  } catch (error) {
    next(error);
  }
};


// Add Member (Only Owner Allowed)
exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    console.log("came here");

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    console.log("Project Owner:", project.owner.toString());
    console.log("Logged-in User:", req.user._id.toString());


    // Only owner can add members
    if (project.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Only owner can add members");
    }

    if (!project.members.includes(userId)) {
      project.members.push(userId);
    }

    await project.save();

    res.json(project);
  } catch (error) {
    next(error);
  }
};
