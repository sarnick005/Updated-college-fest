import { Router } from "express";
import {
  registerUser,
  logoutUser,
  loginUser,
  getCurrentUser,
} from "../controllers/users.Controllers.js";
import { verifyJWT } from "../middlewares/auth.Middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/login").post(loginUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;
