import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Conheça a New & Recycled — empresa portuguesa especializada em toners, tinteiros, consumíveis e material de escritório, com apoio personalizado em cada encomenda.",
};

const valores = [
  {
    titulo: "Validação antes do pagamento",
    texto:
      "Confirmamos stock, disponibilidade e portes antes de pedir qualquer pagamento. Só paga quando tudo estiver confirmado.",
  },
  {
    titulo: "Apoio na compatibilidade",
    texto:
      "Dúvidas sobre qual o toner certo para a sua impressora? Enviamos-nos o modelo e confirmamos a referência antes de encomendar.",
  },
  {
    titulo: "Para empresas e particulares",
    texto:
      "Trabalhamos com escritórios, escolas, comércio local e clientes particulares. Sem mínimo de encomenda.",
  },
  {
    titulo: "Catálogo alargado",
    texto:
      "Toners, tinteiros, papel, rolos térmicos, material escolar, material de escritório e artigos de limpeza — tudo num só lugar.",
  },
];

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-16">

        {/* Hero */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 p-8 lg:grid-cols-[1fr_320px] lg:p-12">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-700">
                Sobre nós
              </p>

              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                New & Recycled
              </h1>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Somos uma empresa portuguesa especializada na venda de consumíveis
                de impressão e material de escritório. O nosso foco é simples:
                ajudar cada cliente a encontrar o produto certo, ao melhor preço,
                com a certeza de que está disponível antes de pagar.
              </p>

              <p className="mt-4 leading-7 text-slate-600">
                Trabalhamos com toners e tinteiros das principais marcas —
                HP, Canon, Epson, Samsung, Xerox, Lexmark, Konica Minolta e
                Kyocera — tanto originais como compatíveis, para que cada cliente
                encontre a solução que mais se adapta ao seu orçamento.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/produtos"
                  className="rounded-full bg-green-700 px-7 py-3 text-center text-sm font-bold text-white transition hover:bg-green-800"
                >
                  Ver catálogo
                </Link>
                <Link
                  href="/contacto"
                  className="rounded-full border border-slate-300 bg-white px-7 py-3 text-center text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
                >
                  Falar connosco
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center rounded-3xl bg-slate-50 p-8">
              <Image
                src="/logotipo.png"
                alt="New & Recycled"
                width={260}
                height={260}
                className="h-auto w-full max-w-[200px] object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Valores */}
        <section className="mt-12">
          <h2 className="text-2xl font-black text-slate-950">
            O que nos distingue
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {valores.map((v) => (
              <article
                key={v.titulo}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="font-black text-slate-950">{v.titulo}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{v.texto}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Contacto comercial */}
        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
            Contacto directo
          </p>

          <h2 className="mt-3 text-2xl font-black">Fale connosco</h2>

          <p className="mt-3 leading-7 text-slate-600">
            Para questões sobre encomendas, compatibilidade de produtos ou
            condições especiais para empresas, contacte-nos directamente.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Responsável
              </p>
              <p className="mt-2 font-black text-slate-950">José Carlos Machado</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Telefone / WhatsApp
              </p>
              <Link
                href="https://wa.me/351968120503"
                className="mt-2 block font-black text-green-700 transition hover:text-green-800"
              >
                968 120 503
              </Link>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Email
              </p>
              <Link
                href="mailto:machado.newrecycle@gmail.com"
                className="mt-2 block break-words font-black text-green-700 transition hover:text-green-800"
              >
                machado.newrecycle@gmail.com
              </Link>
            </div>
          </div>
        </section>

      </section>
    </main>
  );
}
