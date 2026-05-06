// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "node:crypto"; // Ensure crypto is available for bcryptjs

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    otp: String,
    otpExpire: Date,

    resetPasswordOtp: String,
    resetPasswordExpire: Date,

    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);