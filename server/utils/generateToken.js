import jwt from "jsonwebtoken";

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || "freshlink_dev_secret_change_me", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export default generateToken;
