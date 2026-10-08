const express = require("express");

const {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine
} = require("../controllers/medicineController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// Public routes
router.get("/", getMedicines);

router.get("/:id", getMedicineById);


// Admin routes
router.post("/", protect, adminOnly, createMedicine);

router.put("/:id", protect, adminOnly, updateMedicine);

router.delete("/:id", protect, adminOnly, deleteMedicine);


module.exports = router;