const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");

// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const { medicineId, quantity = 1 } = req.body;

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required"
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1"
      });
    }

    // Find medicine
    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    // Check stock
    if (medicine.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available"
      });
    }

    // Find user's cart
    let cart = await Cart.findOne({
      user: req.user.userId
    });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await Cart.create({
        user: req.user.userId,
        items: [
          {
            medicine: medicineId,
            quantity
          }
        ],
        totalPrice: medicine.price * quantity
      });

      return res.status(201).json({
        success: true,
        message: "Medicine added to cart",
        cart
      });
    }

    // Check if medicine already exists
    const existingItem = cart.items.find(
      (item) => item.medicine.toString() === medicineId
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + quantity;

      if (newQuantity > medicine.stock) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock"
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        medicine: medicineId,
        quantity
      });
    }

    // Calculate total
    let totalPrice = 0;

    for (const item of cart.items) {
      const itemMedicine = await Medicine.findById(
        item.medicine
      );

      if (itemMedicine) {
        totalPrice +=
          itemMedicine.price * item.quantity;
      }
    }

    cart.totalPrice = totalPrice;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.medicine", "name price stock category");

    res.status(200).json({
      success: true,
      message: "Medicine added to cart",
      cart: updatedCart
    });
  } catch (error) {
    console.error("Add to cart error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// GET CART
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.userId
    }).populate(
      "items.medicine",
      "name price stock category manufacturer image"
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: {
          items: [],
          totalPrice: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error("Get cart error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// UPDATE QUANTITY
const updateCartQuantity = async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;

    if (!medicineId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID and quantity are required"
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1"
      });
    }

    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    if (quantity > medicine.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock"
      });
    }

    const cart = await Cart.findOne({
      user: req.user.userId
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const item = cart.items.find(
      (item) =>
        item.medicine.toString() === medicineId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Medicine is not in cart"
      });
    }

    item.quantity = quantity;

    let totalPrice = 0;

    for (const cartItem of cart.items) {
      const itemMedicine = await Medicine.findById(
        cartItem.medicine
      );

      if (itemMedicine) {
        totalPrice +=
          itemMedicine.price * cartItem.quantity;
      }
    }

    cart.totalPrice = totalPrice;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate(
        "items.medicine",
        "name price stock category"
      );

    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: updatedCart
    });
  } catch (error) {
    console.error(
      "Update cart quantity error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// REMOVE FROM CART
const removeFromCart = async (req, res) => {
  try {
    const { medicineId } = req.params;

    const cart = await Cart.findOne({
      user: req.user.userId
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const itemExists = cart.items.some(
      (item) =>
        item.medicine.toString() === medicineId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Medicine is not in cart"
      });
    }

    cart.items = cart.items.filter(
      (item) =>
        item.medicine.toString() !== medicineId
    );

    let totalPrice = 0;

    for (const item of cart.items) {
      const medicine = await Medicine.findById(
        item.medicine
      );

      if (medicine) {
        totalPrice +=
          medicine.price * item.quantity;
      }
    }

    cart.totalPrice = totalPrice;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate(
        "items.medicine",
        "name price stock category"
      );

    res.status(200).json({
      success: true,
      message: "Medicine removed from cart",
      cart: updatedCart
    });
  } catch (error) {
    console.error(
      "Remove from cart error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
};