import jwt from "jsonwebtoken";

export async function protectedRoute(req, res, next) {
  try {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(404).json({
        error: "",
        message: "LoginedIn first",
      });
    }

    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedUser; //attaching user data to req object
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
