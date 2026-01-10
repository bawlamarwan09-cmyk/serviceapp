import Rating from "../models/Rating.js";

export const addRating = async (req, res) => {
  const rating = await Rating.create({
    ...req.body,
    client: req.user.id
  });
  res.json(rating);
};
