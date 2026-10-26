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
    <footer className="border-t border-green-900 bg-green-800 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">

          {/* Marca */}
          <section>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <img src="/logotipo.png" alt="New & Recycled" className="h-10 w-auto rounded-lg bg-white/10 object-contain p-1" />
              <span className="text-sm font-black text-white">New &amp; Recycled</span>
            </Link>
            <p className="mt-3 text-sm leading-6 text-green-200">
              Toners, tinteiros, consumíveis e papelaria para empresas e particulares. Portugal continental.
            </p>
            <p className="mt-3 text-sm font-bold text-white">
              Portes 3,75€ · Grátis acima de 60€
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a href="https://wa.me/351968120503" target="_blank" rel="noreferrer"
                className="rounded-full bg-white px-5 py-2.5 text-center text-sm font-bold text-green-800 transition hover:bg-green-50">
                WhatsApp · 968 120 503
              </a>
              <a href="mailto:machado.newrecycle@gmail.com"
                className="rounded-full border border-green-600 px-5 py-2.5 text-center text-sm font-bold text-white transition hover:bg-green-700">
                machado.newrecycle@gmail.com
              </a>
            </div>
          </section>

          {/* Loja */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-green-300">Loja</h3>
            <nav className="mt-3 space-y-2 text-sm text-green-100">
              {linksLoja.map((link) => (
                <Link key={link.href} href={link.href} className="block transition hover:text-white">
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          {/* Apoio */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-green-300">Apoio</h3>
            <nav className="mt-3 space-y-2 text-sm text-green-100">
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
          </section>

          {/* Contactos */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-green-300">Contactos</h3>
            <div className="mt-3 space-y-2 text-sm text-green-100">
              <p><span className="font-bold text-white">Responsável:</span> José Carlos Machado</p>
              <p><span className="font-bold text-white">Morada:</span> Rua Bernardino Machado, nº 119, São Domingos de Rana</p>
              <p><span className="font-bold text-white">NIF:</span> 164 366 423</p>
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-1 border-t border-green-700 pt-4 text-xs text-green-300 sm:flex-row sm:justify-between">
          <p>© 2026 New &amp; Recycled · NIF 164 366 423</p>
          <p>Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
