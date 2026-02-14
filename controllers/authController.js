import { uploadOnCloudinary } from "../config/cloudinary.js";
import upload from "../middlewares/uploadMiddleware.js";
import fs from "fs";
import User from "../models/UserModel.js";

import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (id) => {
  try {
    const user = await User.findById(id);

    let accessToken = user.generateAccessToken();
    let refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    console.log("error in generating  refresh token", error);
  }
};

export async function registerUser(req, res) {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "", error: "All fields are required" });
    }
    //check user exists or not
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "", error: "Email already in use" });

    //check profileImageUrl exist or not

    let profileImageUrl = null; //default
    if (req.file) {
      profileImageUrl = req.file.path;
      let uploadResult = await uploadOnCloudinary(profileImageUrl);
      // store the secure URL string (not the whole upload object)
      profileImageUrl = uploadResult?.secure_url || uploadResult?.url || null;
      // delete the temporary local file uploaded by multer
      try {
        if (req.file && req.file.path) await fs.promises.unlink(req.file.path);
      } catch (err) {
        console.warn("Failed to delete temp upload:", err.message || err);
      }
    }

    //create new user in database
    const createdUser = await User.create({
      fullName,
      email,
      password,
      profileImageUrl,
    });
    let { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      createdUser._id,
    );
    const { unHashedToken, hashToken, tokenExpiry } =
      createdUser.generateRandomToken();
    createdUser.emailVerificationExpiry = tokenExpiry;
    createdUser.emailVerificationToken = hashToken;
    await createdUser.save({ validateBeforeSave: false });

    const user = await User.findById(createdUser._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    const options = { httpOnly: true, secure: true };
    res.status(201).cookie("token", accessToken, options).json({
      message: "user created successfully",
      error: "",
      user,
      accessToken,
    });
  } catch (error) {
    res.status(400).json({
      message: "",
      error: error.message,
    });
  }
}

export async function loginUser(req, res) {
  // Logic for user login

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "",
        error: "Invalid User Credentials",
      });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        message: "",
        error: "User Doesn't exists with this email",
      });
    }
    //if exists   --> verify password
    if (!user.comparePassword(password)) {
      return res.status(401).json({
        message: "",
        error: "Invalid User credentials",
      });
    }
    //correct password  --> generate Token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id,
    );
    const loggedInUser = await User.findById(user._id).select("-password");
    const options = { httpOnly: true, secure: true };
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "user logged In.",
        error: "",
        user: loggedInUser,
        accessToken,
      });
  } catch (error) {
    res.status(401).json({
      message: "",
      error: error.message,
    });
  }
}

export async function logoutUser(req, res) {
  const user = req?.user;
  if (!user) {
    return res.status(500).json({
      message: "",
      error: "Server error",
    });
  }

  await User.findByIdAndUpdate(
    user._id,
    { $set: { refreshToken: "" } },
    { new: true },
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ status: 200, error: "", message: "User loggedOut successfully" });
}

export async function getUserInfo(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(301).json({ error: "User not found" });
    }
    res.status(200).json({
      message: "user find successful",
      error: "",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      message: "",
      error: error.message,
    });
  }
}

export async function uploadProfileImage(req, res) {
  try {
    let profileImageUrl = null;
    if (req.file) {
      profileImageUrl = req.file.path;
      let uploadResult = await uploadOnCloudinary(profileImageUrl);
      // store the secure URL string (not the whole upload object)
      profileImageUrl = uploadResult?.secure_url || uploadResult?.url || null;
      // delete the temporary local file uploaded by multer
      try {
        if (req.file && req.file.path) await fs.promises.unlink(req.file.path);
      } catch (err) {
        console.warn("Failed to delete temp upload:", err.message || err);
      }
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        profileImageUrl,
      },
      { new: true },
    ).select("-password");
    if (!user) {
      return res.status(301).json({ error: "User not found" });
    }

    res
      .status(201)
      .json({ message: "Image updated successfully", error: "", data: user });
  } catch (error) {
    res.status(400).json({
      message: "",
      error: error.message,
    });
  }
}
