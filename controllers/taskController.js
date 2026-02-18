const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../Models/User");

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, priority } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    // Only project members can create tasks
    if (!project.members.some(m => m.equals(req.user._id))) {
      res.status(403);
      throw new Error("Not a project member");
    }

    // Assigned user must also be project member
    if (!project.members.some(m => m.equals(assignedTo))) {
      res.status(400);
      throw new Error("Assigned user not in project");
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      priority
    });

    res.status(201).json(task);

  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const { projectId, status, page = 1, limit = 5 } = req.query;

    const query = { project: projectId };

    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json(tasks);

  } catch (error) {
    next(error);
  }
};


exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const task = await Task.findById(req.params.taskId)
      .populate("project");

    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    const isOwner = task.project.owner.equals(req.user._id);
    const isAssigned = task.assignedTo.equals(req.user._id);

    if (!isOwner && !isAssigned) {
      res.status(403);
      throw new Error("Not authorized to update task");
    }

    task.status = status;
    await task.save();

    res.json(task);

  } catch (error) {
    next(error);
  }
};
