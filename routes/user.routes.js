import { registerUser,login } from "../controllers/user.controllers.js";
import express from "express"


const router = express.Router();
  router.post("/register",registerUser)
  router.post("/login",login)

  export default router