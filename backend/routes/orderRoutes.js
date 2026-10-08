const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create order
router.post("/", protect, createOrder);


// Get logged-in user's orders
router.get("/", protect, getMyOrders);


// Get single order
router.get("/:id", protect, getOrderById);


module.exports = router;