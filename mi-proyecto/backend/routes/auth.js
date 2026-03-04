import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "dev_secret";

router.post("/register", async (req, res) => {
  const { email, password, confirmPassword } = req.body;
    
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email))
  return res.status(400).json({ error: "Email inválido" });

  if (!email || !password || !confirmPassword)
    return res.status(400).json({ error: "Campos obligatorios" });

  if (password !== confirmPassword)
    return res.status(400).json({ error: "Passwords no coinciden" });

  const hashed = await bcrypt.hash(password, 10);

  try {
    db.prepare("INSERT INTO usuarios (email, password) VALUES (?, ?)")
      .run(email, hashed);

    res.status(201).json({ message: "Usuario creado" });
  } catch {
    res.status(400).json({ error: "Email ya registrado" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare("SELECT * FROM usuarios WHERE email = ?")
    .get(email);

  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: "1h"
  });

  res.json({ token });
});

export default router;