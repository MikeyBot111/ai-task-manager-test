"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, saveAuth } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await api.register({ email, username, password });
      saveAuth(auth);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při registraci");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Registrace</h2>
        <p className="auth-sub">Vytvořte si účet a začněte spravovat své úkoly.</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="username">Uživatelské jméno</label>
            <input
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Heslo (min. 6 znaků)</label>
            <input
              id="password"
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Vytvářím účet..." : "Vytvořit účet"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 14, color: "var(--muted)", textAlign: "center" }}>
          Máte účet? <Link href="/login">Přihlaste se</Link>
        </p>
      </div>
    </div>
  );
}
