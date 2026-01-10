import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  const msg = await Message.create({
    demand: req.body.demand,
    sender: req.user.id,
    content: req.body.content
  });
  res.json(msg);
};

export const getMessagesByDemand = async (req, res) => {
  const messages = await Message.find({
    demand: req.params.demandId
  }).populate("sender", "name");
  res.json(messages);
};
