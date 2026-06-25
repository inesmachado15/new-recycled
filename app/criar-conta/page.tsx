"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CriarContaPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(false);

  async function criarConta(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagem("");
    setErro("");
    setACarregar(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
        },
      },
    });

    setACarregar(false);

    if (error) {
      setErro(error.message);
      return;
    }

    setMensagem(
      "Conta criada com sucesso. Já pode iniciar sessão."
    );

    setNome("");
    setEmail("");
    setPassword("");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
          Cliente
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Criar conta
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Crie uma conta para, no futuro, consultar encomendas, guardar dados de
          faturação e repetir pedidos.
        </p>

        <form onSubmit={criarConta} className="mt-8 space-y-5">
          <label className="block text-sm font-semibold">
            Nome completo
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              required
              placeholder="Nome completo"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
            />
          </label>

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
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
            />
          </label>

          {erro && (
            <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              {erro}
            </p>
          )}

          {mensagem && (
            <p className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-800">
              {mensagem}
            </p>
          )}

          <button
            type="submit"
            disabled={aCarregar}
            className="w-full rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {aCarregar ? "A criar conta..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Já tem conta?{" "}
          <a href="/entrar" className="font-bold text-green-700 hover:text-green-800">
            Iniciar sessão
          </a>
        </p>
      </section>
    </main>
  );
}