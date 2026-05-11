import { registerUser,login, verifyUser, logoutUser } from "../controllers/user.controllers.js";
import express from "express"


const router = express.Router();
  router.post("/register",registerUser)
  router.get("/verify/:token",verifyUser)
  router.post("/login",login)
  router.get("/profile",getMe)
  router.get("/logout",logoutUser)
  router.post("/forgot-password", forgotPassword);
  router.post("/reset-password/:token", resetPassword);

  export default router;