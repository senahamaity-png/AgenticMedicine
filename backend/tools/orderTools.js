const Order = require("../models/Order");

// ==========================================
// GET LATEST ORDER STATUS
// ==========================================

const getLatestOrderStatus = async (userId) => {
  try {
    const order = await Order.findOne({
      user: userId
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!order) {
      return null;
    }

    return {
      orderId: order._id.toString(),
      status: order.status,
      totalAmount: order.totalAmount,
      address: order.address,
      createdAt: order.createdAt
    };

  } catch (error) {
    console.error(
      "Get Latest Order Status Error:",
      error.message
    );

    throw new Error(
      "Unable to get latest order status"
    );
  }
};

module.exports = {
  getLatestOrderStatus
};