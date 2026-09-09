import { NextResponse } from "next/server";
import { getDemoUser, Role } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const role = (body.role ?? "student") as Role;
  const user = getDemoUser(role);
  const res = NextResponse.json({ ok: true, user });
  res.cookies.set("mis_role", user.role, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 86400 });
  res.cookies.set("mis_user", user.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 86400 });
  return res;
}
