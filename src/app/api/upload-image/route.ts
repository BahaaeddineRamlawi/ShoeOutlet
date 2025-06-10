import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const API_KEYS = process.env.IMGBB_API_KEYS?.split(",") || [];

const KEY_DOC_REF = doc(db, "apiKeys", "currentIndex");

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
    console.log("API_KEYS:", process.env.IMGBB_API_KEYS); // Remove this after testing

    if (API_KEYS.length === 0) {
      return NextResponse.json(
        { error: "No API keys configured" },
        { status: 500 }
      );
    }

    const snapshot = await getDoc(KEY_DOC_REF);
    let currentIndex = 0;
    if (snapshot.exists()) {
      currentIndex = snapshot.data()?.index ?? 0;
      if (currentIndex >= API_KEYS.length || currentIndex < 0) currentIndex = 0;
    }

    const API_KEY = API_KEYS[currentIndex];

    const formData = new URLSearchParams();
    formData.append("image", image);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      }
    );

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        { error: "Upload failed", details: data },
        { status: 500 }
      );
    }

    const nextIndex = (currentIndex + 1) % API_KEYS.length;
    await setDoc(KEY_DOC_REF, { index: nextIndex });

    return NextResponse.json({ url: data.data.url });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
