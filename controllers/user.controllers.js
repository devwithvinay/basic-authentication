import { error } from "console";
import User from "../models/user.models.js";
import crypto from "crypto";


const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  try {
    const existingUser =await User.findOne({email})
    
    if(existingUser){
        return res.status(400).json({
            message:"User already exists"
        })
    }
    
    // create new user 
const user = await User.create({
    name,email,password
})
// agar ye fullfill nahi hua 

if(!user){
    return res.status(400).json({
        message:"User not registered"
    })
}
    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token 
    await user.save()


  } catch (error) {
    res.status(400).json({
        message:"Something went Wrong",
        error,
    })
    
  }

  res.status(200).json({
    message: "User registered successfully",
  });
};

const login = async (req, res) => {
  res.send("login");
};

export { registerUser, login };
