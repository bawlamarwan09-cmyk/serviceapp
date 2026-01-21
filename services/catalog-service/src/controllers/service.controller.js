import Service from "../models/Service.js";

export const createService = async (req, res) => {
  try {
    const { name, category, description, price, icon } = req.body;

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

export const getServices = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const services = await Service.find(filter).populate(
      "category",
      "name icon"
    );

    res.json(services);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "category",
      "name icon"
    );

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
