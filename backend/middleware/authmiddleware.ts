// middleware/authMiddleware.ts
import jwt from "jsonwebtoken";
import express from "express";
import Analyst from "../models/Analyst";

type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ message: "Not authorized, no token." });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Attach user (without password) to request
    const user = await Analyst.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401).json({ message: "User not found." });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Auth error:", errMsg);
    res.status(401).json({ message: "Not authorized, token failed." });
  }
};

export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Admin access required." });
    return;
  }
  next();
};
