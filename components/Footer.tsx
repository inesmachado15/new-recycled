export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <img
            src="/logotipo.png"
            alt="New & Recycled"
            className="h-20 w-auto rounded-xl bg-white p-2"
          />

          <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
            Soluções para escritório, consumíveis, toners, tinteiros, papel,
            rolos térmicos e material de apoio para empresas e particulares.
          </p>

          <div className="mt-5 space-y-2 text-sm text-slate-300">
            <p>
              <span className="font-bold text-white">Telefone/WhatsApp:</span>{" "}
              <a
                href="https://wa.me/351968120503"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                968 120 503
              </a>
            </p>

            <p>
              <span className="font-bold text-white">Email:</span>{" "}
              <a
                href="mailto:machado.newrecycle@gmail.com"
                className="break-all transition hover:text-white"
              >
                machado.newrecycle@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-green-400">
            Loja
          </h3>

          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <a href="/" className="block transition hover:text-white">
              Início
            </a>

            <a href="/produtos" className="block transition hover:text-white">
              Produtos
            </a>

            <a
              href="/como-encomendar"
              className="block transition hover:text-white"
            >
              Como encomendar?
            </a>

            <a href="/carrinho" className="block transition hover:text-white">
              Carrinho
            </a>

            <a href="/contacto" className="block transition hover:text-white">
              Contacto
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-green-400">
            Apoio e informação legal
          </h3>

          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <a href="/termos" className="block transition hover:text-white">
              Termos e Condições
            </a>

            <a
              href="/privacidade"
              className="block transition hover:text-white"
            >
              Política de Privacidade
            </a>

            <a href="/devolucoes" className="block transition hover:text-white">
              Trocas e Devoluções
            </a>

            <a
              href="mailto:machado.newrecycle@gmail.com"
              className="block break-all transition hover:text-white"
            >
              machado.newrecycle@gmail.com
            </a>

            <a
              href="https://wa.me/351968120503"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Abrir WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-slate-800 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 New & Recycled. Todos os direitos reservados.</p>

        <p>Encomendas sujeitas a confirmação de stock, portes e pagamento.</p>
      </div>
    </footer>
  );
}