"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/app/admin/admin.css";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Invalid password. Please try again.");
      }
    } catch {
      alert("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Admin Login</h1>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <span
            className="material-symbols-outlined eye-icon"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "visibility_off" : "visibility"}
          </span>
        </div>
        <button
          onClick={handleLogin}
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
