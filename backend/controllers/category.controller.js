import Category from "../models/Category.js";

/**
 * CREATE CATEGORY (admin later)
 */
export const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Category name is required" });
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ msg: "Category already exists" });
    }

    const category = await Category.create({
      name,
      icon,
      description,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("createCategory", error);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET ALL CATEGORIES
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error("getCategories", error);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET ONE CATEGORY
 */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * DELETE CATEGORY
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }

    res.json({ msg: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
