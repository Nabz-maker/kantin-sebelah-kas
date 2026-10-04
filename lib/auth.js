import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || "kaskita-dev-secret");
export const SESSION_COOKIE = "kaskita_session";

export async function createSession(user, remember = false) {
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8; // 30 hari vs 8 jam
  const token = await new SignJWT({ uid: user.id, role: user.role, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(SECRET);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  });
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload; // { uid, role, name }
  } catch {
    return null;
  }
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireUser() {
  const s = await getSession();
  if (!s) return null;
  return s;
}
