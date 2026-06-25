"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RedefinirPalavraPassePage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [aGuardar, setAGuardar] = useState(false);
  const [aValidarSessao, setAValidarSessao] = useState(true);
  const [sessaoValida, setSessaoValida] = useState(false);

  useEffect(() => {
    async function prepararSessaoRecuperacao() {
      setAValidarSessao(true);
      setErro("");

      try {
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(
          window.location.hash.replace("#", "")
        );

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        const code = url.searchParams.get("code");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setErro(
              "Não foi possível validar o link de recuperação. Peça um novo link."
            );
            setSessaoValida(false);
            setAValidarSessao(false);
            return;
          }

          if (type === "recovery" || type === "signup" || type === null) {
            setSessaoValida(true);
            setAValidarSessao(false);
            return;
          }
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            setErro(
              "Não foi possível validar o link de recuperação. Peça um novo link."
            );
            setSessaoValida(false);
            setAValidarSessao(false);
            return;
          }

          setSessaoValida(true);
          setAValidarSessao(false);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setSessaoValida(true);
          setAValidarSessao(false);
          return;
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, sessionAtual) => {
          if (
            event === "PASSWORD_RECOVERY" ||
            event === "SIGNED_IN" ||
            sessionAtual
          ) {
            setSessaoValida(true);
            setAValidarSessao(false);
          }
        });

        setTimeout(() => {
          setAValidarSessao(false);
        }, 2000);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Erro ao validar recuperação:", error);
        setErro("Não foi possível validar o link de recuperação.");
        setSessaoValida(false);
        setAValidarSessao(false);
      }
    }

    prepararSessaoRecuperacao();
  }, []);

  async function redefinirPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    const novaPassword = password.trim();
    const confirmacao = confirmarPassword.trim();

    if (novaPassword.length < 6) {
      setErro("A nova palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaPassword !== confirmacao) {
      setErro("As palavras-passe não coincidem.");
      return;
    }

    setAGuardar(true);

    const { error } = await supabase.auth.updateUser({
      password: novaPassword,
    });

    setAGuardar(false);

    if (error) {
      console.error("Erro ao redefinir palavra-passe:", error);

      setErro(
        "Não foi possível redefinir a palavra-passe. O link pode ter expirado ou já ter sido usado."
      );
      return;
    }

    setMensagem("Palavra-passe redefinida com sucesso. Pode iniciar sessão.");
    setPassword("");
    setConfirmarPassword("");

    await supabase.auth.signOut();

    setTimeout(() => {
      router.push("/entrar");
    }, 1800);
  }

  if (aValidarSessao) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            A validar link de recuperação...
          </p>
        </section>
      </main>
    );
  }

  if (!sessaoValida) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
            Link inválido
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight">
            Não foi possível redefinir
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            O link de recuperação pode ter expirado, já ter sido usado ou não
            ter sido aberto corretamente. Peça um novo email de recuperação.
          </p>

          {erro && (
            <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              {erro}
            </p>
          )}

          <a
            href="/recuperar-palavra-passe"
            className="mt-6 inline-flex rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
          >
            Pedir novo link
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
          Conta
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Definir nova palavra-passe
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Introduza uma nova palavra-passe para voltar a aceder à sua conta.
        </p>

        <form onSubmit={redefinirPassword} className="mt-8 space-y-5">
          <label className="block text-sm font-semibold">
            Nova palavra-passe
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              placeholder="Nova palavra-passe"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
            />
          </label>

          <label className="block text-sm font-semibold">
            Confirmar palavra-passe
            <input
              type="password"
              value={confirmarPassword}
              onChange={(event) => setConfirmarPassword(event.target.value)}
              required
              minLength={6}
              placeholder="Confirmar palavra-passe"
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
            disabled={aGuardar}
            className="w-full rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {aGuardar ? "A guardar..." : "Guardar nova palavra-passe"}
          </button>
        </form>
      </section>
    </main>
  );
}