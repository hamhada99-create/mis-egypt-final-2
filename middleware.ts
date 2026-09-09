import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/student", "/student-dashboard", "/parent", "/teacher", "/admin", "/ai", "/gamification", "/notifications", "/learning", "/exams", "/questions"];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (!protectedPrefixes.some((p) => path === p || path.startsWith(p + "/"))) return NextResponse.next();

  const role = req.cookies.get("mis_role")?.value;
  if (!role) return NextResponse.redirect(new URL("/login", req.url));

  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
