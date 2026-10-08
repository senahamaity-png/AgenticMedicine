const express = require("express");

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's cart
router.get("/", protect, getCart);

// Add medicine to cart
router.post("/", protect, addToCart);

// Update quantity
router.put("/quantity", protect, updateCartQuantity);

// Remove medicine
router.delete("/:medicineId", protect, removeFromCart);

module.exports = router;