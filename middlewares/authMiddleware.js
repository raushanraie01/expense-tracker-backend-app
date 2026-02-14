import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

export async function protectedRoute(req, res, next) {
  try {
    let token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");
    console.log("token", token);
    if (!token) {
      res.status(404).json({
        error: "",
        message: "LoginedIn first",
      });
    }
    const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedUser) {
      res.status(404).json({
        error: "",
        message: "Invalid token",
      });
    }
    const user = await User.findById(decodedUser._id).select("-password");
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
