import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
      return NextResponse.json({ success: false, error: "Username & password wajib" }, { status: 400 });
    }
    if (!process.env.SESSION_SECRET) {
      console.error("[POST /api/auth/login] SESSION_SECRET belum diset");
      return NextResponse.json({ success: false, error: "Server belum dikonfigurasi" }, { status: 500 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!ok) {
      return NextResponse.json({ success: false, error: "Username atau password salah" }, { status: 401 });
    }
    const res = NextResponse.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    res.cookies.set(SESSION_COOKIE, createSessionToken(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (e) {
    console.error("[POST /api/auth/login]", e);
    return NextResponse.json({ success: false, error: "Gagal login" }, { status: 500 });
  }
}
