import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import proxy from "express-http-proxy";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/**
 * 🔐 JWT Middleware (اختياري حسب route)
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // routes public كيدوزو
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 مرّر user info للـ services
    req.headers["x-user-id"] = decoded.id;
    req.headers["x-user-role"] = decoded.role;
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }

  next();
};

app.use(authMiddleware);

/**
 * 🚦 ROUTING
 */

// Auth Service
app.use(
  "/api/auth",
  proxy(process.env.AUTH_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/auth${req.url}`,
  })
);

// Catalog Service
app.use(
  "/api/catalog",
  proxy(process.env.CATALOG_SERVICE_URL, {
    proxyReqPathResolver: (req) => req.url.replace("/catalog", ""),
  })
);

// Prestataire Service
app.use(
  "/api/prestataires",
  proxy(process.env.PRESTATAIRE_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/prestataires${req.url}`,
  })
);

app.use(
  "/api/demands",
  proxy(process.env.DEMAND_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/demands${req.url}`,
  })
);

app.use(
  "/api/messages",
  proxy(process.env.MESSAGE_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/messages${req.url}`,
  })
);


app.use(
  "/ratings",
  proxy("http://localhost:5000")
);


/**
 * ❌ 404
 */
app.use((req, res) => {
  res.status(404).json({ msg: "Gateway route not found" });
});

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("API Gateway running on port " + process.env.PORT);
});

