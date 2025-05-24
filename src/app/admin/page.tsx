"use client";
import { useRouter } from "next/navigation";
import "./admin.css";

export default function AdminHomePage() {
  const router = useRouter();

  return (
    <main className="admin-container">
      <h1 className="admin-title">Admin Panel</h1>
      <div className="button-group">
        <button className="button admin-panel" onClick={() => router.push("/admin/add")}>
          + Add Products
        </button>
        <button className="button admin-panel" onClick={() => router.push("/admin/edit")}>
          🛠 Edit Products
        </button>
      </div>
    </main>
  );
}
