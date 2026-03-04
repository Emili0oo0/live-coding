import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  const productos = db.prepare(`
    SELECT p.id, p.nombre, p.descripcion, p.precio, u.email as vendedor
    FROM productos p
    JOIN usuarios u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `).all();

  res.json(productos);
});

router.post("/", authenticateToken, (req, res) => {
  const { nombre, descripcion, precio } = req.body;

  if (!nombre || !descripcion || precio <= 0)
    return res.status(400).json({ error: "Datos inválidos" });

  db.prepare(`
    INSERT INTO productos (user_id, nombre, descripcion, precio)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, nombre, descripcion, precio);

  res.status(201).json({ message: "Producto creado" });
});

router.get("/mine", authenticateToken, (req, res) => {
  const productos = db.prepare(
    "SELECT * FROM productos WHERE user_id = ?"
  ).all(req.user.id);

  res.json(productos);
});

router.delete("/:id", authenticateToken, (req, res) => {
  const producto = db.prepare(
    "SELECT * FROM productos WHERE id = ?"
  ).get(req.params.id);

  if (!producto) return res.status(404).json({ error: "No encontrado" });

  if (producto.user_id !== req.user.id)
    return res.status(403).json({ error: "No autorizado" });

  db.prepare("DELETE FROM productos WHERE id = ?")
    .run(req.params.id);

  res.json({ message: "Producto eliminado" });
});

export default router;