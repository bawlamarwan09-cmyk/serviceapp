import Service from "../models/Service.js";

export const createService = async (req, res) => {
  const service = await Service.create(req.body);
  res.json(service);
};

export const getServices = async (req, res) => {
  const services = await Service.find();
  res.json(services);
};
