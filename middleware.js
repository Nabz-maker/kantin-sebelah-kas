import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || "kaskita-dev-secret");
const PROTECTED = ["/dashboard", "/transaksi", "/pembayaran", "/anggota", "/laporan", "/profil", "/pengaturan"];
const ADMIN_ONLY = ["/anggota", "/pengaturan"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get("kaskita_session")?.value;
  let payload = null;
  if (token) {
    try { ({ payload } = await jwtVerify(token, SECRET)); } catch { payload = null; }
  }
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (ADMIN_ONLY.some((p) => pathname.startsWith(p)) && payload.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/transaksi/:path*", "/pembayaran/:path*", "/anggota/:path*", "/laporan/:path*", "/profil/:path*", "/pengaturan/:path*"] };
