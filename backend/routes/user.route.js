const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  getUserHistory,
  getAllUsers,
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/", authenticate, roleMiddleware(["ADMIN"]), getAllUsers);

router.get("/history", authenticate, getUserHistory);

module.exports = router;
