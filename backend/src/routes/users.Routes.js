import { Router } from "express";
import { registerUser, validateOTP } from "../controllers/users.Controllers.js";
import { verifyJWT } from "../middlewares/auth.Middleware.js";

const router = Router();

router.route("/register").post(registerUser);


export default router;
