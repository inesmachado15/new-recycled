"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RecuperarPalavraPassePage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [aEnviar, setAEnviar] = useState(false);

  async function enviarEmailRecuperacao(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setMensagem("");
    setAEnviar(true);

    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo) {
      setErro("Indique o email da sua conta.");
      setAEnviar(false);
      return;
    }

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/redefinir-palavra-passe`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo, {
      redirectTo,
    });

    setAEnviar(false);

    if (error) {
        console.error("Erro recuperação palavra-passe:", error);

        setErro(
            `Não foi possível enviar o email de recuperação: ${error.message}`
        );
        return;
    }

    setMensagem(
      "Se existir uma conta associada a este email, receberá uma mensagem com instruções para redefinir a palavra-passe."
    );
    setEmail("");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
          Conta
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Recuperar palavra-passe
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Indique o email associado à sua conta. Será enviado um link para
          redefinir a palavra-passe.
        </p>

        <form onSubmit={enviarEmailRecuperacao} className="mt-8 space-y-5">
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
            disabled={aEnviar}
            className="w-full rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {aEnviar ? "A enviar..." : "Enviar email de recuperação"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Lembrou-se da palavra-passe?{" "}
          <a
            href="/entrar"
            className="font-bold text-green-700 hover:text-green-800"
          >
            Iniciar sessão
          </a>
        </p>
      </section>
    </main>
  );
}