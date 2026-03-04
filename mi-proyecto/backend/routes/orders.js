import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:productId", authenticateToken, (req, res) => {
  const producto = db.prepare(
    "SELECT * FROM productos WHERE id = ?"
  ).get(req.params.productId);

  if (!producto)
    return res.status(404).json({ error: "Producto no existe" });

  if (producto.user_id === req.user.id)
    return res.status(400).json({ error: "No puedes comprar tu producto" });

  db.prepare(`
    INSERT INTO pedidos (comprador_id, producto_id)
    VALUES (?, ?)
  `).run(req.user.id, req.params.productId);

  res.status(201).json({ message: "Compra realizada" });
});

router.get("/mine", authenticateToken, (req, res) => {
  const pedidos = db.prepare(`
    SELECT p.id, pr.nombre, pr.precio, p.fecha
    FROM pedidos p
    JOIN productos pr ON p.producto_id = pr.id
    WHERE p.comprador_id = ?
  `).all(req.user.id);

  res.json(pedidos);
});

export default router;