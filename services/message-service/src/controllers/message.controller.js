import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  const msg = await Message.create({
    from: req.headers["x-user-id"],
    to: req.body.to,
    content: req.body.content,
    demandId: req.body.demandId,
  });

  res.status(201).json(msg);
};

export const getMessages = async (req, res) => {
  const { userId } = req.params;

  const messages = await Message.find({
    $or: [{ from: userId }, { to: userId }],
  }).sort({ createdAt: 1 });

  res.json(messages);
};
