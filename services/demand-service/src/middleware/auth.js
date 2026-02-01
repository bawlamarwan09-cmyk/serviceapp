import jwt from "jsonwebtoken";


export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Not authorized, token invalid" });
  }
};

export const onlyPrestataire = (req, res, next) => {
  if (req.user.role !== "prestataire") {
    return res.status(403).json({ msg: "Access denied" });
  }
  next();
};
