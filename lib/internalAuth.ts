import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "internal_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type InternalSessionPayload = {
  email: string;
  member_id: string | null;
  name: string;
  designation: string;
};

function getSecretKey() {
  const secret = process.env.INTERNAL_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing INTERNAL_SESSION_SECRET — check .env.local");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(user: InternalSessionPayload) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySession(token: string | undefined): Promise<InternalSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.email !== "string" || typeof payload.name !== "string" || typeof payload.designation !== "string") {
      return null;
    }
    return {
      email: payload.email,
      member_id: typeof payload.member_id === "string" ? payload.member_id : null,
      name: payload.name,
      designation: payload.designation,
    };
  } catch {
    return null;
  }
}
