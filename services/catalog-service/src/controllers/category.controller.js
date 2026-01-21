import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;

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
    res.status(500).json({ msg: "Server error" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
