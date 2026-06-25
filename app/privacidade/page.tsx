export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
          Informação legal
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Política de Privacidade
        </h1>

        <div className="mt-8 space-y-6 leading-7 text-slate-600">
          <p>
            A New & Recycled respeita a privacidade dos seus utilizadores e
            clientes. Esta política explica que dados podem ser recolhidos
            através do site, para que finalidades são utilizados e de que forma
            o titular dos dados pode exercer os seus direitos.
          </p>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              1. Responsável pelo tratamento
            </h2>
            <p className="mt-2">
              O tratamento dos dados pessoais recolhidos através deste site é
              realizado pela New & Recycled, para efeitos de gestão de pedidos,
              encomendas, contactos comerciais e apoio ao cliente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              2. Dados recolhidos
            </h2>
            <p className="mt-2">
              Poderão ser recolhidos dados como nome, email, telefone, morada,
              código postal, localidade, NIF, dados de empresa, produtos
              encomendados, preferências de contacto, observações introduzidas
              pelo cliente e dados associados à criação de conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              3. Finalidades do tratamento
            </h2>
            <p className="mt-2">
              Os dados são utilizados para criar e gerir contas de cliente,
              responder a contactos, registar pedidos de encomenda, confirmar
              disponibilidade de produtos, validar portes, comunicar dados de
              pagamento, acompanhar o estado da encomenda, tratar trocas ou
              devoluções e emitir documentos comerciais ou fiscais quando
              aplicável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              4. Conta de cliente e autenticação
            </h2>
            <p className="mt-2">
              Para finalizar encomendas é necessário iniciar sessão ou criar
              conta. A autenticação e a gestão técnica da conta podem envolver
              serviços externos utilizados pelo site, nomeadamente a plataforma
              Supabase, necessária para guardar dados de conta, sessão e
              encomendas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              5. Comunicações por email
            </h2>
            <p className="mt-2">
              O cliente poderá receber emails relacionados com a sua conta ou
              encomenda, incluindo confirmação de pedido, aprovação da encomenda,
              confirmação de pagamento, preparação, envio, devoluções e envio de
              documentos associados à encomenda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              6. Conservação dos dados
            </h2>
            <p className="mt-2">
              Os dados serão conservados durante o período necessário para tratar
              pedidos, gerir encomendas, prestar apoio ao cliente e cumprir
              obrigações legais, fiscais ou contabilísticas aplicáveis. Quando
              os dados deixarem de ser necessários, serão eliminados ou
              anonimizados sempre que tal seja possível.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              7. Partilha de dados
            </h2>
            <p className="mt-2">
              Os dados poderão ser tratados por serviços necessários ao
              funcionamento do site, autenticação, alojamento, envio de emails,
              faturação, expedição ou apoio técnico. Apenas serão partilhados os
              dados necessários para cumprir essas finalidades.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              8. Direitos do titular dos dados
            </h2>
            <p className="mt-2">
              Nos termos do RGPD, o titular dos dados pode solicitar acesso,
              retificação, apagamento, limitação do tratamento, oposição ao
              tratamento e portabilidade dos seus dados, quando aplicável. O
              exercício destes direitos pode estar limitado quando exista uma
              obrigação legal de conservação dos dados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              9. Contacto
            </h2>
            <p className="mt-2">
              Para questões sobre privacidade e tratamento de dados, ou para
              exercer os seus direitos, contacte a New & Recycled através do
              email{" "}
              <a
                href="mailto:machado.newrecycle@gmail.com"
                className="break-all font-bold text-green-700 hover:text-green-800"
              >
                machado.newrecycle@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}