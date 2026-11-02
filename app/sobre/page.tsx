import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Conheça a New & Recycled — empresa portuguesa especializada em toners, tinteiros, consumíveis e material de escritório. Saiba como encomendar, os nossos contactos e o que nos distingue.",
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
      "Dúvidas sobre qual o toner certo para a sua impressora? Envie-nos o modelo e confirmamos a referência antes de encomendar.",
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

const passos = [
  {
    numero: "1",
    titulo: "Escolha os produtos",
    texto:
      "Pesquise no catálogo por nome, categoria, marca, referência ou SKU. Depois adicione ao carrinho os produtos que pretende encomendar.",
  },
  {
    numero: "2",
    titulo: "Crie conta ou inicie sessão",
    texto:
      "Para finalizar a encomenda, entre na sua conta ou crie uma nova. Assim consegue acompanhar o estado do pedido na área de cliente.",
  },
  {
    numero: "3",
    titulo: "Submeta a encomenda",
    texto:
      "Confirme os produtos no carrinho, preencha os dados de faturação e entrega, e finalize a encomenda. A New & Recycled analisa e aprova o pedido em breve.",
  },
  {
    numero: "4",
    titulo: "Pagamento e envio",
    texto:
      "Após aprovação, recebe os dados de pagamento por email. Pague por Multibanco ou MB WAY — o pagamento é confirmado automaticamente e a encomenda avança para envio.",
  },
];

const estados = [
  "A aguardar aprovação",
  "Aprovada — aguarda pagamento",
  "Confirmado",
  "Em preparação",
  "Enviado",
];

const perguntas = [
  {
    titulo: "Quando é que pago?",
    texto:
      "Não imediatamente. Após submeter a encomenda, a New & Recycled analisa e aprova o pedido. Só depois recebe os dados de pagamento por email (Multibanco ou MB WAY). Após confirmação do pagamento, a encomenda avança automaticamente.",
  },
  {
    titulo: "E se o produto estiver por encomenda?",
    texto:
      "O prazo de entrega pode ser ligeiramente superior. Será informado por email do estado e prazo estimado após confirmação do pagamento.",
  },
  {
    titulo: "Como confirmo se um tinteiro ou toner é compatível?",
    texto:
      "Se tiver dúvidas, envie-nos a referência do consumível ou o modelo da impressora antes de encomendar. Ajudamos a confirmar a compatibilidade.",
  },
  {
    titulo: "Recebo fatura?",
    texto:
      "Sim. Depois da encomenda ser validada e processada, a documentação associada à venda é emitida com os dados fornecidos pelo cliente.",
  },
];

export default function SobrePage() {
  return (
    <main className="min-h-screen text-slate-900">
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-4">

        {/* Hero */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_220px] lg:gap-8 lg:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-green-700">
                Sobre nós
              </p>

              <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-slate-950">
                New & Recycled
              </h1>

              <p className="mt-3 leading-7 text-slate-600">
                Somos uma empresa portuguesa especializada na venda de consumíveis
                de impressão e material de escritório. O nosso foco é simples:
                ajudar cada cliente a encontrar o produto certo, ao melhor preço,
                com a certeza de que está disponível antes de pagar.
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Trabalhamos com toners e tinteiros das principais marcas —
                HP, Canon, Epson, Samsung, Xerox, Lexmark, Konica Minolta e
                Kyocera — tanto originais como compatíveis.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/produtos"
                  className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
                >
                  Ver catálogo
                </Link>
                <a
                  href="https://wa.me/351968120503"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
                >
                  Falar connosco
                </a>
              </div>
            </div>

            <div className="flex items-center justify-center p-4">
              <Image
                src="/logotipo.png"
                alt="New & Recycled"
                width={200}
                height={200}
                className="h-auto w-full max-w-[160px] object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* O que nos distingue */}
        <section className="mt-6">
          <h2 className="text-xl font-black text-slate-950">O que nos distingue</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {valores.map((v) => (
              <article
                key={v.titulo}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-black text-slate-950">{v.titulo}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{v.texto}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Como encomendar */}
        <section className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-700">
                Encomendas online
              </p>
              <h2 className="mt-2 text-2xl font-black">Como encomendar</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Processo simples e rápido. Paga após aprovação e acompanha a encomenda na área de cliente.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {passos.map((passo) => (
              <article
                key={passo.numero}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-xl font-black text-green-700">
                  {passo.numero}
                </div>
                <h3 className="mt-5 text-xl font-black">{passo.titulo}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{passo.texto}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                Pagamento e envio
              </p>
              <h3 className="mt-4 text-xl font-black">Simples e seguro</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Após a aprovação do pedido, receberá os dados de pagamento por email. Aceitamos Referência Multibanco e MB WAY — o pagamento é confirmado automaticamente.
              </p>
              <div className="mt-4 rounded-2xl bg-green-50 p-4">
                <p className="text-sm font-bold text-green-900">Portes de envio</p>
                <p className="mt-1 text-sm leading-6 text-green-800">
                  3,75€ fixos para Portugal continental. Grátis em compras iguais ou superiores a 60€. Prazo habitual: 2 a 5 dias úteis.
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                Estados da encomenda
              </p>
              <h3 className="mt-4 text-xl font-black">Acompanhe tudo na sua conta</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Depois de submeter o pedido, pode consultar a encomenda na área de cliente e acompanhar a evolução do estado.
              </p>
              <div className="mt-4 grid gap-2">
                {estados.map((estado) => (
                  <div
                    key={estado}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-green-700" />
                    <span className="text-sm font-bold text-slate-800">{estado}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
            Perguntas frequentes
          </p>
          <h2 className="mt-3 text-2xl font-black">Antes de finalizar a encomenda</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {perguntas.map((pergunta) => (
              <article key={pergunta.titulo} className="rounded-2xl bg-slate-50 p-5">
                <h3 className="text-base font-black text-slate-950">{pergunta.titulo}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{pergunta.texto}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
            Contacto
          </p>
          <h2 className="mt-2 text-xl font-black">Fale connosco</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Para questões sobre encomendas, compatibilidade de produtos, pedidos de orçamento ou condições especiais para empresas, contacte-nos directamente.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="https://wa.me/351968120503"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-green-700 px-7 py-3 text-center text-sm font-bold text-white transition hover:bg-green-800"
            >
              Abrir WhatsApp
            </a>
            <a
              href="mailto:machado.newrecycle@gmail.com"
              className="rounded-full border border-slate-300 bg-white px-7 py-3 text-center text-sm font-bold text-slate-900 transition hover:border-green-700 hover:text-green-700"
            >
              Enviar email
            </a>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Responsável
              </p>
              <p className="mt-2 font-black text-slate-950">José Carlos Machado</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Apoio na escolha de produtos, compatibilidades e condições comerciais.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Telefone / WhatsApp
              </p>
              <a
                href="https://wa.me/351968120503"
                className="mt-2 block font-black text-green-700 transition hover:text-green-800"
              >
                968 120 503
              </a>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Contacto direto para dúvidas e acompanhamento de encomendas.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Email
              </p>
              <a
                href="mailto:machado.newrecycle@gmail.com"
                className="mt-2 block break-words font-black text-green-700 transition hover:text-green-800"
              >
                machado.newrecycle@gmail.com
              </a>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Ideal para orçamentos, empresas e informação detalhada.
              </p>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="mt-6 rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-black">Pronto para encomendar?</h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Consulte o catálogo, adicione os produtos ao carrinho e finalize a encomenda com sessão iniciada. Pague de forma segura e acompanhe a encomenda na área de cliente.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/produtos"
                className="rounded-full bg-green-700 px-8 py-4 text-center text-base font-bold text-white transition hover:bg-green-800"
              >
                Ver produtos
              </Link>
              <Link
                href="/entrar?criarConta=1"
                className="rounded-full border border-slate-600 px-8 py-4 text-center text-base font-bold text-white transition hover:border-green-400 hover:text-green-400"
              >
                Criar conta
              </Link>
            </div>
          </div>
        </section>

      </section>
    </main>
  );
}
