import express from "express";
import bcrypt from "bcryptjs";
import Analyst from "../models/Analyst";
import { protect, adminOnly } from "../middleware/authmiddleware";

type Request = express.Request;
type Response = express.Response;

const router = express.Router();

interface CreateAnalystRequest {
  name: string;
  email: string;
  password: string;
  location: string;
  role?: string;
}

// GET /api/analysts  (protected, all authenticated users can view)
router.get("/", protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const analysts = await Analyst.find()
      .select("-password") // never send password hashes to the client
      .sort({ createdAt: -1 });
    res.json(analysts);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Server error";
    console.error("GET /api/analysts error:", err);
    res.status(500).json({ message: errMsg });
  }
});

// POST /api/analysts  (protected, admin only)
router.post(
  "/",
  protect,
  adminOnly,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, location, role } =
        req.body as CreateAnalystRequest;

      if (!name || !email || !password || !location) {
        res.status(400).json({
          message: "All fields (name, email, password, location) are required.",
        });
        return;
      }

      const exists = await Analyst.findOne({ email });
      if (exists) {
        res.status(409).json({ message: "Email already registered." });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const analyst = await Analyst.create({
        name,
        email,
        password: hashedPassword,
        location,
        role: role || "analyst",
      });

      const { password: _omit, ...safe } = analyst.toObject();
      res.status(201).json(safe);
    } catch (err: any) {
      console.error("POST /api/analysts error:", err);
      if (err.code === 11000) {
        res.status(409).json({ message: "Email already registered." });
        return;
      }
      const errMsg = err instanceof Error ? err.message : "Server error";
      res.status(500).json({ message: errMsg });
    }
  }
);

// DELETE /api/analysts/:id  (protected, admin only)
router.delete(
  "/:id",
  protect,
  adminOnly,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await Analyst.findByIdAndDelete(req.params.id);
      res.json({ message: "Analyst deleted successfully" });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Server error";
      console.error("DELETE /api/analysts/:id error:", err);
      res.status(500).json({ message: errMsg });
    }
  }
);

export default router;
