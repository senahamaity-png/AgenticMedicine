const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");

// ==========================================
// GET USER CART
// ==========================================

const getCart = async (userId) => {
  try {
    const cart = await Cart.findOne({
      user: userId
    }).populate("items.medicine");

    if (!cart) {
      return {
        items: [],
        totalPrice: 0
      };
    }

    return {
      items: cart.items,
      totalPrice: cart.totalPrice
    };

  } catch (error) {
    console.error("Get Cart Tool Error:", error);
    throw new Error("Unable to get cart");
  }
};


// ==========================================
// ADD MEDICINE TO CART
// ==========================================

const addToCart = async (
  userId,
  medicineId,
  quantity = 1
) => {
  try {
    const medicine = await Medicine.findById(
      medicineId
    );

    if (!medicine) {
      throw new Error("Medicine not found");
    }

    if (medicine.stock < quantity) {
      throw new Error(
        `Only ${medicine.stock} units are available`
      );
    }

    let cart = await Cart.findOne({
      user: userId
    });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalPrice: 0
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.medicine.toString() ===
        medicineId.toString()
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + quantity;

      if (newQuantity > medicine.stock) {
        throw new Error(
          `Only ${medicine.stock} units are available`
        );
      }

      existingItem.quantity = newQuantity;

    } else {
      cart.items.push({
        medicine: medicineId,
        quantity: quantity
      });
    }


    // Calculate total price
    let totalPrice = 0;

    for (const item of cart.items) {
      const itemMedicine =
        await Medicine.findById(
          item.medicine
        );

      if (itemMedicine) {
        totalPrice +=
          itemMedicine.price *
          item.quantity;
      }
    }

    cart.totalPrice = totalPrice;

    await cart.save();


    // Return updated cart
    const updatedCart =
      await Cart.findById(cart._id)
        .populate("items.medicine");

    return {
      items: updatedCart.items,
      totalPrice: updatedCart.totalPrice
    };

  } catch (error) {
    console.error(
      "Add To Cart Tool Error:",
      error
    );

    throw new Error(
      error.message ||
      "Unable to add medicine to cart"
    );
  }
};


// ==========================================
// EXPORT TOOLS
// ==========================================

module.exports = {
  getCart,
  addToCart
};