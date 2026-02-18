const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {

    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    console.log("accessToken: ", accessToken);
    console.log("refreshToken: ", refreshToken);

    res.status(201).json({
      _id: user._id,
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {

    const { email, password } = req.body;

    console.log(req.body);

    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      console.log("accessToken: ", accessToken);
      console.log("refreshToken: ", refreshToken);

      console.log("Generated Token:", token);
      res.json({
        _id: user._id,
        accessToken : accessToken,
        refreshToken : refreshToken
      });
    } else {
      res.status(401);
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {

    const { refreshToken } = req.body;

    console.log(refreshToken);

    if (!refreshToken) {
      res.status(401);
      throw new Error("No refresh token provided");
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log("not done")

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    console.log("It is created");

    res.json({ accessToken: newAccessToken });

  } catch (error) {
    console.log("REFRESH ERROR:", error.message);
    return res.status(403).json({ message: error.message });
  }
};
