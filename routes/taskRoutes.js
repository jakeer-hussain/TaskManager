const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createTask,
  getTasks,
  updateTaskStatus
} = require("../controllers/taskController");

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.put("/:taskId/status", protect, updateTaskStatus);

module.exports = router;
