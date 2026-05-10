import { SignJWT, jwtVerify } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || "super-secret-key-for-development-only";
  return new TextEncoder().encode(secret);
};

export interface TokenPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "USER";
  [key: string]: any;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecretKey());
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getJwtSecretKey());
  return payload as unknown as TokenPayload;
}
