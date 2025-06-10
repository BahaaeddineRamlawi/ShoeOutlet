import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const token = req.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("adminToken="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ verified: false }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json({ verified: false }, { status: 401 });
  }
}
