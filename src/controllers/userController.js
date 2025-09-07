import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import { sendEmail } from "../lib/sendEmail.js";
// Generate JWT
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// SIGNUP
export const signupUser = async (req, res) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res.status(400).json({ message: "Email or Username already exists" });

    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min

    const user = await User.create({
      name,
      username,
      email,
      password, // will be hashed in pre-save hook
      otp: { code: otpCode, expires: otpExpiry, verified: false },
    });

    // Send OTP email
    await sendEmail(
      email,
      "Verify your OTP",
      `<p>Hello ${name},</p><p>Your OTP is <strong>${otpCode}</strong></p>`
    );

    res.status(201).json({ message: "Signup successful, verify OTP", email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// VERIFY OTP
export const verifySignupOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp.verified) return res.status(400).json({ message: "Already verified" });
    if (Date.now() > user.otp.expires) return res.status(400).json({ message: "OTP expired" });
    if (Number(otp) !== user.otp.code) return res.status(400).json({ message: "Invalid OTP" });

    user.otp.verified = true;
    user.otp.code = null;
    user.otp.expires = null;
    await user.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESEND OTP
export const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp.verified) return res.status(400).json({ message: "Already verified" });

    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min

    user.otp.code = otpCode;
    user.otp.expires = otpExpiry;
    await user.save();

    await sendEmail(
      email,
      "Resend OTP",
      `<p>Hello ${user.name},</p><p>Your new OTP code is <strong>${otpCode}</strong></p>`
    );

    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Please provide email and password" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    if (!user.otp.verified) return res.status(401).json({ success: false, message: "Please verify your OTP before logging in" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid password" });

    res.status(200).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
      success: true,
      message: "Login Successful"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Get current logged-in user
export const getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    return res.status(200).json({ user: req.user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Update Name
export const updateName = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ fixed
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name;
    await user.save();

    res.json({ message: "Name updated successfully", name: user.name });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ fixed
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Current password is incorrect" });

    user.password = newPassword; // ✅ will be hashed in pre-save hook
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

