import { Request, Response } from "express";
import dotenv from "dotenv";
import twilio from "twilio";
import { PrismaClient } from "@prisma/client";
import { apiStatusCodes } from "@/constants";
import { getUserByMobileNumber,addUserToDB } from "@/query";
import { generateToken,createSession,verifyOTPCode, sendAPIResponse } from "@/utils";


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
    return res.status(apiStatusCodes.BAD_REQUEST).json({ msg: "Failed to send OTP" });
  }
};



export const verifyOtp = async (req: Request, res: Response): Promise<any> => {
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        error: 'Phone number and code are required',
        message: 'Validation error',
      })
    );
  }

  const { status: otpVerified, error: otpError } = await verifyOTPCode(phoneNumber, code);

  if (!otpVerified) {
    return res.status(apiStatusCodes.UNAUTHORIZED).json(
      sendAPIResponse({
        status: false,
        error: otpError,
        message: 'OTP verification failed',
      })
    );
  }

  let { data: userData } = await getUserByMobileNumber(phoneNumber);

  if (!userData) {
    const { data: newUser, error: createError } = await addUserToDB({ phoneNumber });
    if (createError || !newUser) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({ status: false, error: createError, message: 'User creation failed' })
      );
    }
    userData = newUser;
  }

  const token = generateToken(userData.id, phoneNumber);

  const sessionResult = await createSession(userData.id, token);
  if (!sessionResult.success) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({ status: false, error: sessionResult.error, message: 'Session creation failed' })
    );
  }

  return res.status(apiStatusCodes.OKAY).json(
    sendAPIResponse({
      status: true,
      data: token,
      message: 'OTP verified successfully',
    })
  );
};
