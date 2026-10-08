const express = require("express");

const {
  getAllOrders,
  updateOrderStatus
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// Get all orders
router.get(
  "/orders",
  protect,
  adminOnly,
  getAllOrders
);


// Update order status
router.put(
  "/orders/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);


module.exports = router;