"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EntrarPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(false);
  const [aRedirecionar, setARedirecionar] = useState(false);

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    const criarConta = parametros.get("criarConta");

    if (criarConta === "1") {
      setARedirecionar(true);
      router.replace("/criar-conta");
    }
  }, [router]);

  async function entrar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setACarregar(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setACarregar(false);

    if (error) {
      setErro("Email ou palavra-passe incorretos.");
      return;
    }

    router.push("/conta");
  }

  if (aRedirecionar) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            A abrir criação de conta...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
          Cliente
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Iniciar sessão
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Entre na sua conta para consultar dados, acompanhar encomendas e
          repetir pedidos.
        </p>

        <form onSubmit={entrar} className="mt-8 space-y-5">
          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="exemplo@email.com"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
            />
          </label>

          <label className="block text-sm font-semibold">
            Palavra-passe
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="A sua palavra-passe"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
            />
          </label>

          <div className="flex justify-end">
            <a
              href="/recuperar-palavra-passe"
              className="text-sm font-bold text-green-700 hover:text-green-800"
            >
              Esqueci-me da palavra-passe
            </a>
          </div>

          {erro && (
            <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={aCarregar}
            className="w-full rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {aCarregar ? "A entrar..." : "Iniciar sessão"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Ainda não tem conta?{" "}
          <a
            href="/criar-conta"
            className="font-bold text-green-700 hover:text-green-800"
          >
            Criar conta
          </a>
        </p>
      </section>
    </main>
  );
}