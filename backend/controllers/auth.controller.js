const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const adminExists = await User.exists({ role: "ADMIN" });

    if (role === "ADMIN") {
      if (!adminExists) {
        const user = await User.create({ name, email, password, role });
        return res
          .status(201)
          .json({ message: "First Admin created successfully", user });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader)
        return res
          .status(403)
          .json({ message: "Only an Admin can create another Admin" });

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "ADMIN")
        return res.status(403).json({
          message: "Access denied: only Admins can create another Admin",
        });

      const user = await User.create({ name, email, password, role });
      return res
        .status(201)
        .json({ message: "Admin created successfully", user });
    }

    const user = await User.create({ name, email, password, role });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };
