const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createProject,
  getMyProjects,
  addMember
} = require("../controllers/projectController");

router.post("/", protect, createProject);
router.get("/", protect, getMyProjects);
router.put("/:projectId/add-member", protect, addMember);

module.exports = router;
