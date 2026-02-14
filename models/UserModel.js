import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profileImageUrl: {
      type: String,
      default: null,
    },
    refreshToken: { type: String, select: false },
    forgotPasswordToken: { type: String },
    forgotPasswordExpiry: { type: Date },
    emailVerificationToken: { type: String },
    emailVerificationExpiry: { type: Date },
  },
  {
    timestamps: true,
  },
);

//Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = bcrypt.hash(this.password, 10);
});

//creating method or function for comparing password

userSchema.methods.comparePassword = async function (password) {
  //return booleans
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

//generate random token to verify email and reset password
userSchema.methods.generateRandomToken = function () {
  const unHashedToken = crypto.randomBytes(32).toString("hex");
  //hash it
  const hashToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + 15 * 60 * 1000; //15 min from now
  return { unHashedToken, hashToken, tokenExpiry };
};

const User = mongoose.model("User", userSchema);

export default User;
