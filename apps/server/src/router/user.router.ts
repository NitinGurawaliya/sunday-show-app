import { Router } from "express";
import { sendOTP,verifyOTP } from "@/controllers/user.controller";

const userRouter = Router();

userRouter.post('/sendOtp',sendOTP)
userRouter.post('/verifyOtp',verifyOTP)

export default userRouter