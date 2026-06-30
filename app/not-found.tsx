import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-20 text-center text-slate-900">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-700">
        Erro 404
      </p>

      <h1 className="mt-4 text-6xl font-black tracking-tight text-slate-950">
        Página não encontrada
      </h1>

      <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
        A página que procura não existe ou foi removida. Explore o catálogo ou
        contacte-nos se precisar de ajuda.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/produtos"
          className="rounded-full bg-green-700 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-green-800"
        >
          Ver catálogo
        </Link>

        <Link
          href="/"
          className="rounded-full border border-slate-300 bg-white px-8 py-3.5 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
        >
          Voltar ao início
        </Link>

        <Link
          href="/contacto"
          className="rounded-full border border-slate-300 bg-white px-8 py-3.5 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
        >
          Contacto
        </Link>
      </div>
    </main>
  );
}
