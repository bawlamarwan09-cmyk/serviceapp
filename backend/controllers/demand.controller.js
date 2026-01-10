import Demand from "../models/Demand.js";

export const createDemand = async (req, res) => {
  const demand = await Demand.create({
    ...req.body,
    client: req.user.id
  });
  res.json(demand);
};

export const getPrestataireDemands = async (req, res) => {
  const demands = await Demand.find()
    .populate("client service prestataire");
  res.json(demands);
};

export const acceptDemand = async (req, res) => {
  const d = await Demand.findByIdAndUpdate(req.params.id, { status: "accepted" }, { new: true });
  res.json(d);
};

export const refuseDemand = async (req, res) => {
  const d = await Demand.findByIdAndUpdate(req.params.id, { status: "refused" }, { new: true });
  res.json(d);
};
