import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { password } = await req.json();

  const docRef = doc(db, "admin", "credentials");
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return NextResponse.json(
      { error: "Admin credentials not set." },
      { status: 400 }
    );
  }

  const storedHash = snapshot.data().hashedPassword;
  const isMatch = bcrypt.compareSync(password, storedHash);

  if (!isMatch) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "JWT secret is not defined." },
      { status: 500 }
    );
  }

  const token = jwt.sign({ role: "admin" }, secret, { expiresIn: "1h" });

  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: "adminToken",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600, // 1 hour
    path: "/",
    sameSite: "lax",
  });

  return response;
}
