import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  userId?: string;
  phone?: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: "Authorization header missing" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; phone: string };

    // Check session in DB
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return res.status(401).json({ msg: "Invalid session" });

    // Check if session expired
    if (session.expiresAt < new Date()) {
      return res.status(401).json({ msg: "Session expired" });
    }

    // Auto-extend session expiry by 30 days on each request
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 30);

    await prisma.session.update({
      where: { token },
      data: { expiresAt: newExpiry },
    });

    req.userId = decoded.userId;
    req.phone = decoded.phone;

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};
