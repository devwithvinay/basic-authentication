import { registerUser,login, verifyUser, logoutUser,getMe,forgotPassword,resetPassword } from "../controllers/user.controllers.js";
import express from "express"


const router = express.Router();
  router.post("/register",registerUser)
  router.get("/verify/:token",verifyUser)
  router.post("/login",login)
  router.get("/getme",getMe)
  router.get("/logout",logoutUser)
  router.post("/forgot-password", forgotPassword);
  router.post("/reset-password/:token", resetPassword);

  export default router;