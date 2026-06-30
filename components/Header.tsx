"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CarrinhoItem = {
  id: string;
  quantidade: number;
};

function obterEmailsAdmin() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export default function Header() {
  const pathname = usePathname();

  const [quantidadeCarrinho, setQuantidadeCarrinho] = useState(0);
  const [menuAberto, setMenuAberto] = useState(false);
  const [temSessao, setTemSessao] = useState(false);
  const [eAdmin, setEAdmin] = useState(false);

  useEffect(() => {
    const emailsAdmin = obterEmailsAdmin();

    function atualizarQuantidade() {
      const carrinho: CarrinhoItem[] = JSON.parse(
        localStorage.getItem("carrinho") || "[]"
      );

      const total = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
      setQuantidadeCarrinho(total);
    }

    function atualizarSessao(sessionEmail?: string | null) {
      const existeSessao = !!sessionEmail;

      setTemSessao(existeSessao);

      if (!sessionEmail) {
        setEAdmin(false);
        return;
      }

      setEAdmin(emailsAdmin.includes(sessionEmail.toLowerCase()));
    }

    async function verificarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      atualizarSessao(session?.user?.email || null);
    }

    atualizarQuantidade();
    verificarSessao();

    window.addEventListener("storage", atualizarQuantidade);

    const intervalo = setInterval(atualizarQuantidade, 500);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      atualizarSessao(session?.user?.email || null);
    });

    return () => {
      window.removeEventListener("storage", atualizarQuantidade);
      clearInterval(intervalo);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMenuAberto(false);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center" onClick={fecharMenu}>
          <img
            src="/logotipo.png"
            alt="New & Recycled"
            className="h-28 w-auto object-contain sm:h-32"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
          <Link
            href="/"
            onClick={fecharMenu}
            className="transition hover:text-green-700"
          >
            Início
          </Link>

          <Link
            href="/produtos"
            onClick={fecharMenu}
            className="transition hover:text-green-700"
          >
            Produtos
          </Link>

          <Link
            href="/como-encomendar"
            onClick={fecharMenu}
            className="transition hover:text-green-700"
          >
            Como encomendar?
          </Link>

          <Link
            href="/sobre"
            onClick={fecharMenu}
            className="transition hover:text-green-700"
          >
            Sobre nós
          </Link>

          <Link
            href="/contacto"
            onClick={fecharMenu}
            className="transition hover:text-green-700"
          >
            Contacto
          </Link>

          <Link
            href={temSessao ? "/conta" : "/entrar"}
            onClick={fecharMenu}
            className="transition hover:text-green-700"
          >
            {temSessao ? "Conta" : "Entrar"}
          </Link>

          {eAdmin && (
            <Link
              href="/admin"
              onClick={fecharMenu}
              className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-green-700"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/carrinho"
            onClick={fecharMenu}
            className="relative rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Carrinho
            {quantidadeCarrinho > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow">
                {quantidadeCarrinho > 9 ? "9+" : quantidadeCarrinho}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMenuAberto(!menuAberto)}
            className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-green-700 hover:text-green-700 md:hidden"
          >
            {menuAberto ? "Fechar" : "Menu"}
          </button>
        </div>
      </div>

      {menuAberto && (
        <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-3 text-sm font-semibold text-slate-700">
            <Link
              href="/"
              onClick={fecharMenu}
              className="rounded-2xl px-4 py-3 transition hover:bg-green-50 hover:text-green-700"
            >
              Início
            </Link>

            <Link
              href="/produtos"
              onClick={fecharMenu}
              className="rounded-2xl px-4 py-3 transition hover:bg-green-50 hover:text-green-700"
            >
              Produtos
            </Link>

            <Link
              href="/como-encomendar"
              onClick={fecharMenu}
              className="rounded-2xl px-4 py-3 transition hover:bg-green-50 hover:text-green-700"
            >
              Como encomendar?
            </Link>

            <Link
              href="/sobre"
              onClick={fecharMenu}
              className="rounded-2xl px-4 py-3 transition hover:bg-green-50 hover:text-green-700"
            >
              Sobre nós
            </Link>

            <Link
              href="/contacto"
              onClick={fecharMenu}
              className="rounded-2xl px-4 py-3 transition hover:bg-green-50 hover:text-green-700"
            >
              Contacto
            </Link>

            <Link
              href={temSessao ? "/conta" : "/entrar"}
              onClick={fecharMenu}
              className="rounded-2xl px-4 py-3 transition hover:bg-green-50 hover:text-green-700"
            >
              {temSessao ? "Conta" : "Entrar"}
            </Link>

            {eAdmin && (
              <Link
                href="/admin"
                onClick={fecharMenu}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-white transition hover:bg-green-700"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}