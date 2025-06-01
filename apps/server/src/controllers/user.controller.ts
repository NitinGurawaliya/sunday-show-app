import { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const sendOTP = async (req: Request, res: Response): Promise<any> => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ msg: "Phone number required" });

  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID!)
      .verifications.create({ to: phone, channel: "sms" });

    return res.json({ msg: "OTP sent", sid: verification.sid });
  } catch (err) {
    console.error("Twilio Error:", err);
    return res.status(500).json({ msg: "Failed to send OTP" });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<any> => {
  const { phone, code } = req.body;

  if (!phone || !code) return res.status(400).json({ msg: "Phone and code required" });

  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID!)
      .verificationChecks.create({ to: phone, code });

    if (verificationCheck.status === "approved") {
      // Check if user exists or create new //also convert it to a util function
      let user = await prisma.user.findUnique({ where: { phoneNumber: phone } });
      if (!user) {
        user = await prisma.user.create({
          data: { phoneNumber: phone },
        });
      }

      // Create JWT token  //convert this to a util function
      const token = jwt.sign({ userId: user.id, phone }, process.env.JWT_SECRET!, {
        expiresIn: "30d",
      });

      // Create session with 30 days expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);


      //convert this to a query function 
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      //convert api responses to a util functions
      return res.json({ msg: "OTP verified", token });
    } else {
      return res.status(401).json({ msg: "Invalid OTP" });
    }
  } catch (err) {
    console.error("Verification Error:", err);
    return res.status(500).json({ msg: "OTP verification failed" });
  }
};
