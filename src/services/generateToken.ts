import * as jwt from "jsonwebtoken";

export type Role = {
  role: "ADMIN" | "COMPANY" | "CLIENT" | "WORKER";
};

export type AuthToken = {
  id: string;
  role: Role;
};

export const generateToken = (payload: AuthToken): string => {
  const newToken = jwt.sign(payload, process.env.JWT_KEY as string, {
    expiresIn: "24h",
  });
  return newToken;
};

export const getTokenData = (token: string): AuthToken => {
  const newToken = token.split(" ")[1];
  const tokenData = jwt.verify(newToken, process.env.JWT_KEY as string);
  return tokenData as AuthToken;
};
