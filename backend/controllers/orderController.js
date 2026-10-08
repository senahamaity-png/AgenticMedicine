const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");

// ==========================================
// CREATE ORDER
// ==========================================

const createOrder = async (req, res) => {
  try {
    const { address } = req.body;

    // 1. Check address
    if (!address || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required"
      });
    }

    // 2. Find user's cart
    const cart = await Cart.findOne({
      user: req.user.userId
    }).populate("items.medicine");

    // 3. Check cart
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // 4. Check stock for every medicine
    for (const item of cart.items) {
      if (!item.medicine) {
        return res.status(400).json({
          success: false,
          message: "One of the medicines is no longer available"
        });
      }

      if (item.quantity > item.medicine.stock) {
        return res.status(400).json({
          success: false,
          message: `${item.medicine.name} has insufficient stock`
        });
      }
    }

    // 5. Prepare order items
    const orderItems = cart.items.map((item) => ({
      medicine: item.medicine._id,
      name: item.medicine.name,
      quantity: item.quantity,
      price: item.medicine.price
    }));

    // 6. Calculate total from database price
    const totalAmount = orderItems.reduce(
      (total, item) => {
        return total + item.price * item.quantity;
      },
      0
    );

    // 7. Create order
    const order = await Order.create({
      user: req.user.userId,
      items: orderItems,
      totalAmount,
      address: address.trim(),
      status: "Pending"
    });

    // 8. Reduce medicine stock
    for (const item of cart.items) {
      await Medicine.findByIdAndUpdate(
        item.medicine._id,
        {
          $inc: {
            stock: -item.quantity
          }
        }
      );
    }

    // 9. Clear cart
    cart.items = [];
    cart.totalPrice = 0;

    await cart.save();

    // 10. Send response
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    console.error("Create order error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ==========================================
// GET MY ORDERS
// ==========================================

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId
    })
      .populate("items.medicine")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("Get orders error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ==========================================
// GET SINGLE ORDER
// ==========================================

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.medicine");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check order ownership
    if (order.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this order"
      });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Get order error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};