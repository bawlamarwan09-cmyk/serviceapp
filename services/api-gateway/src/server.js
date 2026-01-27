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
 * 🔓 PUBLIC AUTH ROUTES (NO JWT HERE)
 */
app.use(
  "/api/auth",
  proxy(process.env.AUTH_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/auth${req.url}`,
  })
);

/**
 * 🔐 JWT MIDDLEWARE (PROTECT EVERYTHING ELSE)
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 FORWARD AUTH HEADER
    req.headers["authorization"] = authHeader;

    req.headers["x-user-id"] = decoded.id;
    req.headers["x-user-role"] = decoded.role;
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }

  next();
};


app.use(authMiddleware);


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
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (srcReq.headers.authorization) {
        proxyReqOpts.headers['Authorization'] = srcReq.headers.authorization;
      }
      return proxyReqOpts;
    },
  })
);
app.use(
  "/api/messages",
  proxy(process.env.MESSAGE_SERVICE_URL || "http://localhost:4004", {
    proxyReqPathResolver: (req) => `/api/messages${req.url}`,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (srcReq.headers.authorization) {
        proxyReqOpts.headers['Authorization'] = srcReq.headers.authorization;
      }
      if (srcReq.headers['content-type']) {
        proxyReqOpts.headers['Content-Type'] = srcReq.headers['content-type'];
      }
      return proxyReqOpts;
    },
  })
);

// Ratings (example)
app.use("/ratings", proxy("http://localhost:5000"));

/**
 * ❌ FALLBACK
 */
app.use((req, res) => {
  res.status(404).json({ msg: "Gateway route not found" });
});

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("API Gateway running on port " + process.env.PORT);
});
