"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, saveAuth } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await api.login({ username, password });
      saveAuth(auth);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při přihlášení");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Přihlášení</h2>
        <p className="auth-sub">Vítejte zpět ve správě úkolů.</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="username">Uživatelské jméno</label>
            <input
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Heslo</label>
            <input
              id="password"
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Přihlašuji..." : "Přihlásit se"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 14, color: "var(--muted)", textAlign: "center" }}>
          Nemáte účet? <Link href="/register">Zaregistrujte se</Link>
        </p>
      </div>
    </div>
  );
}
