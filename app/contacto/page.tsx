import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacte a New & Recycled para dúvidas sobre toners, tinteiros, material de escritório, compatibilidades, orçamentos e acompanhamento de encomendas.",
};

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-green-50 p-6 shadow-sm sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
            Contacto
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Fale connosco
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
            Para dúvidas sobre produtos, pedidos de orçamento, compatibilidades,
            disponibilidade ou entregas, entre em contacto com a New & Recycled.
            Para encomendar, recomendamos usar o catálogo e finalizar o pedido
            através da sua conta.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Telefone / WhatsApp
            </p>

            <h2 className="mt-4 text-2xl font-black">968 120 503</h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Contacto direto para dúvidas, pedidos de orçamento,
              compatibilidades e acompanhamento de encomendas.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Email
            </p>

            <h2 className="mt-4 break-all text-xl font-black sm:break-normal">
              machado.newrecycle@gmail.com
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Ideal para pedidos de orçamento, empresas, envio de referências,
              fotografias ou informação detalhada.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Responsável comercial
            </p>

            <h2 className="mt-4 text-2xl font-black">José Carlos Machado</h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Apoio na escolha de produtos, confirmação de compatibilidades,
              disponibilidade e condições comerciais.
            </p>
          </article>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Antes de encomendar
            </p>

            <h2 className="mt-4 text-2xl font-black">
              Confirme a referência certa
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Em toners e tinteiros, envie sempre a referência do produto ou o
              modelo da impressora caso tenha dúvidas. Isto ajuda a evitar
              encomendas erradas e permite confirmar a compatibilidade antes da
              compra.
            </p>

            <div className="mt-5 rounded-2xl bg-green-50 p-4 text-sm leading-6 text-green-900">
              Exemplo: “Procuro tinteiros compatíveis com HP DeskJet 2720” ou
              “Preciso da referência HP 305XL”.
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Encomendas
            </p>

            <h2 className="mt-4 text-2xl font-black">
              Como funciona o pedido?
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>1. Escolha os produtos no catálogo e adicione ao carrinho.</p>

              <p>2. Inicie sessão ou crie conta para finalizar a encomenda.</p>

              <p>3. Submeta o pedido com os dados de faturação e entrega.</p>

              <p>
                4. Efectue o pagamento (Multibanco ou MB WAY). A encomenda avança automaticamente após confirmação.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}