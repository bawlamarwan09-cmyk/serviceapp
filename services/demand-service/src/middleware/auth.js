import jwt from "jsonwebtoken";

// In your protect middleware
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ msg: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ ADD DEBUG
    console.log("🔐 Auth middleware:");
    console.log("   decoded:", decoded);
    console.log("   decoded.id:", decoded.id);
    
    req.user = {
      id: decoded.id,  // ✅ Make sure this exists
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ msg: "Token invalid" });
  }
};

export const onlyPrestataire = (req, res, next) => {
  if (req.user.role !== "prestataire") {
    return res.status(403).json({ msg: "Access denied" });
  }
  next();
};
