const medicineAgent = require("../agents/medicineAgent");


// ==========================================
// AI CHAT
// ==========================================

const chatWithAgent = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const reply = await medicineAgent(
  message.trim(),
  req.user.userId
);

    res.status(200).json({
      success: true,
      reply
    });

  }catch (error) {
  console.error(
    "AI controller error:",
    error.message
  );

  res.status(500).json({
    success: false,
    message: error.message
  });

};
};


module.exports = {
  chatWithAgent
};