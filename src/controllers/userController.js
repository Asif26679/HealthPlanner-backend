import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import { sendMail } from "../lib/sendMail.js";
import { tempUsers } from "../temp/tempStorage.js";
// Generate JWT
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const signupUser = async (req, res) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res.status(400).json({ message: "Email or Username already exists" });

    // Create user (password will be hashed automatically by pre-save hook)
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
 // Store temporarily
 tempUsers[email] = { name, username, email, password, otp: otpCode, expires: otpExpiry };
  
    // const user = await User.create({
    //   name,
    //   username,
    //   email,
    //   password, // raw password
    //   otp: { code: otpCode, expires: otpExpiry, verified: false },
    // });

    // Send OTP email
    await sendMail(
      email,
      "Verify your OTP",
      `<p>Hello ${name},</p><p>Your OTP is <strong>${otpCode}</strong>. It expires in 5 minutes.</p>`
    );

    res.status(201).json({ message: "Signup successful, verify OTP", email });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== VERIFY OTP =====================
export const verifySignupOtp = async (req, res) => {
  const { email, otp } = req.body;

  const tempUser = tempUsers[email];
  if (!tempUser) return res.status(400).json({ message: "No signup request found" });

  if (Date.now() > tempUser.expires) {
    delete tempUsers[email];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (Number(otp) !== tempUser.otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // Hash password and save to DB
  const hashedPassword = await bcrypt.hash(tempUser.password, 10);
  const user = await User.create({
    name: tempUser.name,
    username: tempUser.username,
    email: tempUser.email,
    password: tempUser.password,
    otp: { verified: true },
  });

  // Remove from temp storage
  delete tempUsers[email];

  // Optionally generate token
  const token = generateToken(user._id);

  res.status(201).json({ message: "Signup successful", token, user: { id: user._id, name: user.name, email: user.email } });
};

// ===================== RESEND OTP =====================
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  const tempUser = tempUsers[email];
  if (!tempUser) return res.status(404).json({ message: "No signup request found" });

  const otpCode = Math.floor(100000 + Math.random() * 900000);
  const otpExpiry = Date.now() + 5 * 60 * 1000;

  tempUser.otp = otpCode;
  tempUser.expires = otpExpiry;

  // Send OTP email
  await sendMail(
    email,
    "Resend OTP",
    `<p>Hello ${tempUser.name},</p><p>Your new OTP is <strong>${otpCode}</strong>. It expires in 5 minutes.</p>`
  );

  res.json({ message: "OTP resent successfully" });
};

// ===================== LOGIN =====================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid password" });

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
      success: true,
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Get current logged-in user
import User from "../models/userModel.js"; // adjust path if different

export const getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    // Fetch user from DB to get username, email, etc.
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user);
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

