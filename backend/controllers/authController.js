// controllers/authController.js
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { generateOTP } from "../utils/otp.js";
import { sendEmail } from "../utils/sendEmail.js";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    console.log("Register request:", { fullName, email, password: "***" });

    if (!fullName || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "User exists" });

    const otp = generateOTP();
    console.log("Generated OTP:", otp);

    console.log("Creating user...");
    const user = await User.create({
      fullName,
      email,
      password,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
    });
    console.log("User created:", user._id);

    try {
      await sendEmail({
        to: email,
        subject: "OTP Verification",
        html: `OTP: ${otp}`,
      });
      console.log("Email sent successfully");
    } catch (emailErr) {
      console.log("Email send failed:", emailErr);
      // Continue without failing the registration
    }

    res.json({
      success: true,
      message: "OTP generated",
      token: generateToken(user._id),
      otp, // dev only
    });
  }  catch (err) {
  console.log("🔥 FULL ERROR:", err);

  return res.status(500).json({
    success: false,
    message: err.message,
  });
}
};

// VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    const user = req.user;

    if (!otp) {
      return res.status(400).json({ message: "OTP required" });
    }

    if (!user.otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otp !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.isActive = true; 
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();
    console.log("User verified and saved, isActive:", user.isActive);

    res.json({
      success: true,
      message: "Verified successfully",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  if (!user.isVerified)
    return res.status(403).json({ message: "Verify email first" });

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return res.status(400).json({ message: "Invalid credentials" });

  const token = generateToken(user._id);

  res.json({ token, user });
};

// RESEND OTP
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  const otp = generateOTP();

  user.otp = otp;
  user.otpExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  try {
    await sendEmail({
      to: email,
      subject: "Resend OTP",
      html: `OTP: ${otp}`,
    });
  } catch (emailErr) {
    console.log("Email send failed:", emailErr);
  }

  res.json({ success: true });
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  const otp = generateOTP();

  user.resetPasswordOtp = otp;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  try {
    await sendEmail({
      to: email,
      subject: "Reset Password",
      html: `OTP: ${otp}`,
    });
  } catch (emailErr) {
    console.log("Email send failed:", emailErr);
  }

  res.json({ success: true });
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (
    !user ||
    user.resetPasswordOtp !== otp ||
    user.resetPasswordExpire < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.password = newPassword;
  user.resetPasswordOtp = undefined;

  await user.save();

  res.json({ success: true });
};

// GET PROFILE
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  user.fullName = req.body.fullName || user.fullName;

  await user.save();

  res.json(user);
};