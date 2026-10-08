const express = require("express");

const {
  chatWithAgent
} = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// AI Chat
router.post(
  "/chat",
  protect,
  chatWithAgent
);


module.exports = router;