import express from "express";
import "express-async-errors";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";

import leadsRouter from "./routes/leads.js";
import analyticsRouter from "./routes/analytics.js";
import logsRouter from "./routes/logs.js";
import sequencesRouter from "./routes/sequences.js";
import statsRouter from "./routes/stats.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(__dirname, "../../frontend/dist");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "same-origin");
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const secureCompare = (actual, expected) => {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
};

app.use((req, res, next) => {
  const expectedUsername = process.env.DASHBOARD_USERNAME;
  const expectedPassword = process.env.DASHBOARD_PASSWORD;

  if (!expectedUsername && !expectedPassword && process.env.NODE_ENV !== "production") {
    return next();
  }

  if (!expectedUsername || !expectedPassword) {
    return res.status(503).json({
      error: "Dashboard authentication is not configured",
    });
  }

  const authorization = req.headers.authorization || "";
  const [scheme, encodedCredentials] = authorization.split(" ");

  if (scheme === "Basic" && encodedCredentials) {
    const decoded = Buffer.from(encodedCredentials, "base64").toString("utf8");
    const separatorIndex = decoded.indexOf(":");
    const username = separatorIndex >= 0 ? decoded.slice(0, separatorIndex) : "";
    const password = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : "";

    if (
      secureCompare(username, expectedUsername) &&
      secureCompare(password, expectedPassword)
    ) {
      return next();
    }
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="AutoNova Dashboard"');
  return res.status(401).send("Authentication required");
});

app.use("/api/leads", leadsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/sequences", sequencesRouter);
app.use("/api/stats", statsRouter);

app.get("/api", (req, res) => {
  res.json({
    name: "AutoNova Dashboard API",
    status: "ok",
    health: "/api/health",
  });
});

if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    return res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

const server = app.listen(PORT, () => {
  console.log(`AutoNova Dashboard running on port ${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the existing backend or set PORT to a free port.`,
    );
    process.exit(1);
  }

  throw error;
});

export default app;
