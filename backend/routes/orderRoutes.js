
const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrderDashboardStats,
} = require("../controllers/orderController");

router.get("/dashboard-stats", getOrderDashboardStats);
router.get("/", getOrders);
router.post("/", createOrder);
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
