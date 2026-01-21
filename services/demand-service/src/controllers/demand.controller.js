import Demand from "../models/Demand.js";

// create demand
export const createDemand = async (req, res) => {
  const { prestataireId, serviceId, message } = req.body;

  const demand = await Demand.create({
    clientId: req.headers["x-user-id"],
    prestataireId,
    serviceId,
    message,
  });

  res.status(201).json(demand);
};

// get my demands
export const getMyDemands = async (req, res) => {
  const userId = req.headers["x-user-id"];

  const list = await Demand.find({
    $or: [{ clientId: userId }, { prestataireId: userId }],
  });

  res.json(list);
};

// update status
export const updateStatus = async (req, res) => {
  const { status } = req.body;

  const demand = await Demand.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(demand);
};
