import adminAuthRoutes from "./routes/adminAuth.js";
import adminRoutes from "./routes/adminRoutes.js";
import cors from "cors";
import express from "express";
import inquiriesAdmin from "./routes/inquiriesAdmin.js";
import inquiriesPublic from "./routes/inquiriesPublic.js";
import paymentRoutes from "./routes/payments.js";
import recommendRoutes from "./routes/recommend.js";

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",          // local dev (Vite)
      "http://localhost:3000",          // optional CRA
      "https://realty-spotters-front.vercel.app" // Vercel frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use(express.json());

/* ---------- ROUTES ---------- */
app.use("/api/recommend-neighborhoods", recommendRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin-auth", adminAuthRoutes);
app.use("/api/inquiries", inquiriesPublic);
app.use("/api/admin/inquiries", inquiriesAdmin);

/* ---------- HEALTH / TEST ROUTE ---------- */
app.get("/", (req, res) => {
  res.send("API running");
});

export default app;
