import Link from "next/link";

const linksLoja = [
  { href: "/", label: "Início" },
  { href: "/produtos?categoria=Toners", label: "Toners" },
  { href: "/produtos?categoria=Tinteiros", label: "Tinteiros" },
  { href: "/produtos?categoria=Consumíveis", label: "Consumíveis" },
  { href: "/produtos?categoria=Papelaria", label: "Papelaria" },
  { href: "/produtos?categoria=Equipamento de Escritório", label: "Equipamento" },
  { href: "/como-encomendar", label: "Como encomendar?" },
  { href: "/contacto", label: "Contacto" },
];

const linksApoio = [
  { href: "/devolucoes", label: "Trocas e Devoluções" },
  { href: "/termos", label: "Termos e Condições" },
  { href: "/privacidade", label: "Política de Privacidade" },
  { href: "https://www.livroreclamacoes.pt", label: "Livro de Reclamações" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <section>
            <Link href="/" className="inline-flex">
              <img
                src="/logotipo.png"
                alt="New & Recycled"
                className="h-20 w-auto rounded-2xl bg-white p-2"
              />
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Toners, tinteiros, consumíveis e papelaria para empresas e particulares.
              Envio para todo o Portugal continental.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-sm font-bold text-white">
                Portes fixos 3,75€
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Envio para todo o Portugal continental. Portes grátis em compras iguais ou superiores a 60€.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-green-400">
              Loja
            </h3>

            <nav className="mt-5 space-y-3 text-sm text-slate-300">
              {linksLoja.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-green-400">
              Apoio
            </h3>

            <nav className="mt-5 space-y-3 text-sm text-slate-300">
              {linksApoio.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-sm font-bold text-white">
                Dúvidas sobre compatibilidade?
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Envie-nos o modelo da impressora ou a referência do tinteiro ou
                toner antes de encomendar.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-green-400">
              Contactos
            </h3>

            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div>
                <p className="font-bold text-white">Telefone / WhatsApp</p>

                <a
                  href="https://wa.me/351968120503"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-lg font-black text-white transition hover:text-green-400"
                >
                  968 120 503
                </a>
              </div>

              <div>
                <p className="font-bold text-white">Email</p>

                <a
                  href="mailto:machado.newrecycle@gmail.com"
                  className="mt-1 inline-block break-all transition hover:text-white"
                >
                  machado.newrecycle@gmail.com
                </a>
              </div>

              <div>
                <p className="font-bold text-white">Responsável comercial</p>
                <p className="mt-1 leading-6 text-slate-300">José Carlos Machado</p>
              </div>

              <div>
                <p className="font-bold text-white">Morada</p>
                <p className="mt-1 leading-6 text-slate-300">
                  Rua Bernardino Machado, nº 119<br />
                  São Domingos de Rana
                </p>
              </div>

              <div>
                <p className="font-bold text-white">NIF</p>
                <p className="mt-1 text-slate-300">164 366 423</p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <a
                  href="https://wa.me/351968120503"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-green-700 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-green-800"
                >
                  Abrir WhatsApp
                </a>

                <a
                  href="mailto:machado.newrecycle@gmail.com"
                  className="rounded-full border border-slate-700 px-5 py-3 text-center text-sm font-bold text-white transition hover:border-green-400 hover:text-green-400"
                >
                  Enviar email
                </a>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 grid gap-4 border-t border-slate-800 pt-6 text-xs leading-6 text-slate-400 sm:grid-cols-[1fr_auto] sm:items-center">
          <p>© 2026 New & Recycled · NIF 164 366 423 · Rua Bernardino Machado, nº 119, São Domingos de Rana</p>
          <p className="sm:text-right">Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}