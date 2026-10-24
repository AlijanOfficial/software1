"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browser } from "@/lib/browser";
import { btn, input } from "@/components/ui";

export default function Login() {
  const r = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in"), [email, setEmail] = useState(""), [pw, setPw] = useState(""), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const sb = browser();
    const { error } = mode === "in" ? await sb.auth.signInWithPassword({ email, password: pw }) : await sb.auth.signUp({ email, password: pw });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (mode === "up") return setMsg("Account created. Check your email to confirm, then sign in.");
    r.push("/"); r.refresh();
  }
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 p-4">
      <form onSubmit={go} className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-8 shadow-2xl">
        <div><div className="text-2xl font-extrabold text-teal-700">LeadPilot</div><p className="text-sm text-slate-500">{mode === "in" ? "Sign in to your workspace" : "Create your workspace"}</p></div>
        <input className={input} type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
        <input className={input} type="password" required minLength={8} placeholder="Password (8+ characters)" value={pw} onChange={e => setPw(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} />
        {msg && <p className="text-sm font-medium text-red-600">{msg}</p>}
        <button className={btn + " w-full"} disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}</button>
        <button type="button" className="w-full text-sm text-teal-700 underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }}>{mode === "in" ? "Need an account? Sign up" : "Have an account? Sign in"}</button>
      </form>
    </div>
  );
}
