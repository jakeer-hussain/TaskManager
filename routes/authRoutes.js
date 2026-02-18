const express = require("express");
const router = express.Router();
const { register, login, refreshToken } = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

console.log("canme now");

router.get("/profile", protect, (req, res) => {
  console.log("Profile route hit");
    res.json(req.user);
});

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

module.exports = router;
