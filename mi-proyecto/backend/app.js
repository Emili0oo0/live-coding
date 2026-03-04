import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: "Error interno" });
});

app.listen(3000, () => {
  console.log("Servidor en puerto 3000");
});