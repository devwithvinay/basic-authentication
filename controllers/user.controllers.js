import bcrypt from "bcryptjs";
import User from "../models/user.models.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }



    // create new user
    const user = await User.create({
      username,
      email,
      password,
    });

    // agar ye fullfill nahi hua
    if (!user) {
      return res.status(400).json({
        message: "User not registered",
      });
    }

    // generate verification token
    const token = crypto.randomBytes(32).toString("hex");

    user.verificationToken = token;

    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOption = {
      from: process.env.MAILTRAP_SENDERMAIL,
      to: user.email,
      subject: "Verify your email",
      text: `Please click on the following link ${process.env.BASE_URL}/api/v1/user/verify/${token}`,
    };

    await transporter.sendMail(mailOption);

    return res.status(200).json({
      message: "User registered Successfully",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: "User is not registered",
      success: false,
      error,
    });
  }
};

// verify user

const verifyUser = async (req, res) => {
  const { token } = req.params;

  console.log(token);

  // validate

  if (!token) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }

  // find user by token

  const user = await User.findOne({
    verificationToken: token,
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }

  // set isVerified fields to true

  user.isVerified = true;

  // remove verification token

  user.verificationToken = null;

  // save it

  await user.save();

  return res.status(200).json({
    message: "Email verified successfully",
    success: true,
  });
};

// login

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    // user is verified or not 
    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log(isMatch);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "24h",
      },
    );

    const cookieOption = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOption);

    return res.status(200).json({
      message: "Login Successfully",
      token,
      user: {
        role: user.role,
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

// getMe

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    console.log(user);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error to getMe", error);

    return res.status(400).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Logged Out User

const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {});

    return res.status(200).json({
      message: "Logout successfully",
      success: true,
    });
  } catch (error) {
    console.log("Something went wrong");
  }
};

// Forgot Password

const forgotPassword = async (req, res) => {

  try {

    // get email

    const { email } = req.body;

    // find user based on email

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // reset token + reset expiry => Date.now() + 10 * 60 * 1000 => user.save()

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPassword = resetToken;

    user.resetPasswordExpiry =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    // send mail => design url

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOption = {
      from: process.env.MAILTRAP_SENDERMAIL,
      to: user.email,
      subject: "Reset Password",
      text: `Please click on the following link to reset your password:
      ${process.env.BASE_URL}/api/v1/user/reset-password/${resetToken}`,
    };

    await transporter.sendMail(mailOption);

    return res.status(200).json({
      message: "Reset password link sent successfully",
      success: true,
    });

  } catch (error) {

    return res.status(400).json({
      message: "Something went wrong",
      success: false,
      error,
    });

  }
};

const resetPassword = async(req,res) =>{
   try {
     // get token from params 
     const {token}= req.params

     //get neww password
     const {password} = req.body;
    // validate 

    if(!token || !password){
      return res.status(400).json({
        message:"Token and password required"
      })
    }
    // find user by token
    const user = await User.findOne({
      resetPassword:token,
      resetPasswordExpiry:{$gt:Date.now()}
    });
    // check User
    if(!user){
      return res.status(400).json({
        message:"Invalid or expired token"
      })
    }
    // Update password
    user.password = password;

    // remove reset token 
    user.resetPassword = null;
    user.resetPasswordExpiry = null;
    
    //save 
    await user.save();
    return res.status(200).json({
      message: "Password reset successfully",
      success: true,
    });

   } catch (error) {
      return res.status(500).json({
        message: "Something went wrong",
        success: false,
        error,
      });
   }
}

export { registerUser, verifyUser, login, getMe, logoutUser, forgotPassword,resetPassword };
