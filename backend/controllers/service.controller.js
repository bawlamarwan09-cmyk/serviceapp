import Service from "../models/Service.js";

/**
 * CREATE SERVICE
 */
export const createService = async (req, res) => {
  try {
    const { name, category, description, price, icon } = req.body;

    if (!name || !category) {
      return res.status(400).json({ msg: "Name and category are required" });
    }

    const service = await Service.create({
      name,
      category,
      description,
      price,
      icon,
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET SERVICES (by category)
 */
export const getServices = async (req, res) => {
  try {
    const filter = {};

    // 🔥 filter by category ID
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const services = await Service.find(filter)
      .populate("category", "name icon");

    res.json(services);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
