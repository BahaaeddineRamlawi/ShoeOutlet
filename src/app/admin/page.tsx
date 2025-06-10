"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./admin.css";

export default function AdminHomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch("/api/admin/verify");
        if (!res.ok) throw new Error("Unauthorized");
        setIsLoading(false);
      } catch {
        router.push("/admin/login");
      }
    };
    verifyAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="admin-container">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <main className="admin-container">
      <h1 className="admin-title">Admin Panel</h1>
      <div className="button-group">
        <button
          className="button admin-panel"
          onClick={() => router.push("/admin/add")}
        >
          + Add Products
        </button>
        <button
          className="button admin-panel"
          onClick={() => router.push("/admin/edit")}
        >
          🛠 Edit Products
        </button>
      </div>
    </main>
  );
}
