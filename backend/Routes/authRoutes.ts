// backend/routes/authRoutes.ts
import express from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import Analyst from "../models/Analyst";

type Request = express.Request;
type Response = express.Response;

const router = express.Router();

interface LoginRequest {
  email: string;
  password: string;
}

const generateToken = (user: any): string => {
  return jwt.sign(
    { id: user._id, role: user.role || "analyst" },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || "1h") as SignOptions["expiresIn"] }
  );
};

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await Analyst.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "analyst",
      },
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Server error";
    console.error("POST /api/auth/login error:", err);
    res.status(500).json({ message: errMsg });
  }
});

export default router;
