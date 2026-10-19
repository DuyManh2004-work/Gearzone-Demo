
const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  updateUserStatus,
} = require("../controllers/userController");

// GET /api/users - Danh sách khách hàng
router.get("/", getUsers);

// PATCH /api/users/:id/status - Khóa hoặc mở khóa tài khoản
router.patch("/:id/status", updateUserStatus);

// GET /api/users/:id - Chi tiết khách hàng
router.get("/:id", getUserById);

module.exports = router;
