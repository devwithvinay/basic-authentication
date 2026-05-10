import { error } from "console";
import User from "../models/user.models.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
  



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
    username,email,password
})
// agar ye fullfill nahi hua 

if(!user){
    return res.status(400).json({
        message:"User not registered"
    })
}
    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token 
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOption= {
      from: process.env.MAILTRAP_SENDERMAIL,
      to: user.email,
      subject:"Verify your email",
      text:`Please click on the following link ${process.env.BASE_URL}/api/v1/user/verify/${token}`,      
    }
    await transporter.sendMail(mailOption)
     return res.status(200).json({
       message: "User registered Successfully",
       success: true,
     });

  } catch (error) {
    return res.status(400).json({
        message:"User is not registered",
        success:false,
        error,
    })
    
  }
};

const login = async (req, res) => {
  res.send("login");
};

export { registerUser, login };
