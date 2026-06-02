import dotenv from "dotenv";
dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
  expiresIn: "1d",
};
