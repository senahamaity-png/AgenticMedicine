const Medicine = require("../models/Medicine");

// CREATE MEDICINE
const createMedicine = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      stock,
      manufacturer,
      image,
      prescriptionRequired
    } = req.body;

    if (
      !name ||
      !category ||
      !description ||
      price === undefined ||
      stock === undefined ||
      !manufacturer
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required medicine fields"
      });
    }

    const medicine = await Medicine.create({
      name,
      category,
      description,
      price,
      stock,
      manufacturer,
      image,
      prescriptionRequired
    });

    res.status(201).json({
      success: true,
      message: "Medicine created successfully",
      medicine
    });

  } catch (error) {
    console.error("Create medicine error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// GET ALL MEDICINES
const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: medicines.length,
      medicines
    });

  } catch (error) {
    console.error("Get medicines error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// GET SINGLE MEDICINE
const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    res.status(200).json({
      success: true,
      medicine
    });

  } catch (error) {
    console.error("Get medicine error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// UPDATE MEDICINE
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      medicine: updatedMedicine
    });

  } catch (error) {
    console.error("Update medicine error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// DELETE MEDICINE
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    await Medicine.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Medicine deleted successfully"
    });

  } catch (error) {
    console.error("Delete medicine error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine
};