const Medicine = require("../models/Medicine");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

// 1. Search medicines
async function searchMedicine(query) {
  try {
    console.log("Searching medicine for:", query);

    const safeQuery = query
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const medicines = await Medicine.find({
      $or: [
        {
          name: {
            $regex: safeQuery,
            $options: "i"
          }
        },
        {
          category: {
            $regex: safeQuery,
            $options: "i"
          }
        },
        {
          manufacturer: {
            $regex: safeQuery,
            $options: "i"
          }
        }
      ]
    }).select(
      "_id name category description price stock manufacturer prescriptionRequired image"
    );

    console.log(
      "Search results:",
      medicines
    );

    return {
      success: true,
      medicines
    };

  } catch (error) {

    console.error(
      "searchMedicine error:",
      error
    );

    return {
      success: false,
      message: "Unable to search medicines",
      medicines: []
    };
  }
}

// 2. Check medicine stock
async function checkStock(medicineId) {
  try {
    const medicine = await Medicine.findById(medicineId).select(
      "name stock"
    );

    if (!medicine) {
      return {
        success: false,
        message: "Medicine not found"
      };
    }

    return {
      success: true,
      medicine: medicine.name,
      stock: medicine.stock,
      available: medicine.stock > 0
    };
  } catch (error) {
    return {
      success: false,
      message: "Unable to check stock"
    };
  }
}


// 3. Get medicine details
async function getMedicineDetails(medicineId) {
  try {
    const medicine = await Medicine.findById(medicineId).select(
      "name category description price stock manufacturer prescriptionRequired image"
    );

    if (!medicine) {
      return {
        success: false,
        message: "Medicine not found"
      };
    }

    return {
      success: true,
      medicine
    };
  } catch (error) {
    return {
      success: false,
      message: "Unable to get medicine details"
    };
  }
}


// 4. Get user's cart
async function getCart(userId) {
  try {
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.medicine"
    );

    if (!cart) {
      return {
        success: true,
        items: [],
        totalPrice: 0
      };
    }

    return {
      success: true,
      items: cart.items,
      totalPrice: cart.totalPrice
    };
  } catch (error) {
    return {
      success: false,
      message: "Unable to get cart"
    };
  }
}


// 5. Add medicine to cart
async function addToCart(userId, medicineId, quantity = 1) {
  try {
    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      return {
        success: false,
        message: "Medicine not found"
      };
    }

    if (medicine.stock < quantity) {
      return {
        success: false,
        message: "Not enough stock available"
      };
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalPrice: 0
      });
    }

    const existingItem = cart.items.find(
      (item) => item.medicine.toString() === medicineId
    );

    if (existingItem) {
      if (
        existingItem.quantity + quantity >
        medicine.stock
      ) {
        return {
          success: false,
          message: "Requested quantity exceeds available stock"
        };
      }

      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        medicine: medicineId,
        quantity
      });
    }

    cart.totalPrice = 0;

    for (const item of cart.items) {
      const itemMedicine = await Medicine.findById(
        item.medicine
      );

      if (itemMedicine) {
        cart.totalPrice +=
          itemMedicine.price * item.quantity;
      }
    }

    await cart.save();

    return {
      success: true,
      message: `${medicine.name} added to cart`,
      cart
    };
  } catch (error) {
    console.error("addToCart tool error:", error);

    return {
      success: false,
      message: "Unable to add medicine to cart"
    };
  }
}


// 6. Get order status
async function getOrderStatus(userId, orderId) {
  try {
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    }).select(
      "items totalAmount address status createdAt"
    );

    if (!order) {
      return {
        success: false,
        message: "Order not found"
      };
    }

    return {
      success: true,
      order
    };
  } catch (error) {
    return {
      success: false,
      message: "Unable to get order status"
    };
  }
}


module.exports = {
  searchMedicine,
  checkStock,
  getMedicineDetails,
  getCart,
  addToCart,
  getOrderStatus
};