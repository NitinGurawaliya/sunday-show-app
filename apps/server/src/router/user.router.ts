import { Router } from "express";
import { sendOTP,verifyOtp } from "@/controllers/user.controller";

const userRouter = Router();

userRouter.post('/sendOtp',sendOTP)
userRouter.post('/verifyOtp',verifyOtp)

export default userRouter