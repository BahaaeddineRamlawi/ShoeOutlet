import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const secret = process.env.JWT_SECRET;

  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    const token = request.cookies.get("adminToken")?.value;

    if (!token || !secret) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      jwt.verify(token, secret);
      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
      response.cookies.delete("adminToken");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
