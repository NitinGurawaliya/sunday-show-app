import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import twilio from "twilio";
import dotenv from "dotenv";
import { APIResponseType } from "@/interfaces";
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const generateToken = (userId: string, phoneNumber: string): string => {
  return jwt.sign({ userId, phoneNumber }, process.env.JWT_SECRET!, { expiresIn: "30d" });
};

export const createSession = async (userId: string, token: string): Promise<{ success: boolean, error?: string }> => {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Session creation error:", error);
    return { success: false, error: error.message || "Failed to create session" };
  }
};


export const verifyOTPCode = async (
  phoneNumber: string,
  code: string
): Promise<{ status: "approved" | "failed"; error?: string }> => {
  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID!)
      .verificationChecks.create({ to: phoneNumber, code });

    if (verification.status === "approved") {
      return { status: "approved" };
    } else {
      return { status: "failed", error: "OTP verification failed" };
    }
  } catch (error: any) {
    return { status: "failed", error: error.message || "OTP verification error" };
  }
};

export const sendAPIResponse = ({ status, error, message, data }: APIResponseType) => {
  return { status, error, message, data };
};
