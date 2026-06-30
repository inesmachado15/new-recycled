import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de privacidade e protecção de dados da New & Recycled — como os seus dados são recolhidos, tratados e protegidos ao abrigo do RGPD.",
};

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

        <p className="mt-2 text-sm text-slate-500">
          Última actualização: Junho de 2026
        </p>

        <div className="mt-8 space-y-6 leading-7 text-slate-600">
          <p>
            A New & Recycled respeita a privacidade dos seus utilizadores e
            clientes. Esta política explica que dados podem ser recolhidos
            através do site, para que finalidades são utilizados e de que forma
            o titular dos dados pode exercer os seus direitos ao abrigo do
            Regulamento Geral sobre a Protecção de Dados (RGPD —
            Regulamento UE 2016/679).
          </p>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              1. Responsável pelo tratamento
            </h2>
            <p className="mt-2">
              O responsável pelo tratamento dos dados pessoais recolhidos através
              deste site é:
            </p>
            <ul className="mt-2 space-y-1 pl-4">
              <li><span className="font-semibold text-slate-800">Nome:</span> José Carlos Macedo Machado</li>
              <li><span className="font-semibold text-slate-800">NIF:</span> 164366423</li>
              <li><span className="font-semibold text-slate-800">Morada:</span> <span className="italic text-slate-400">[a preencher]</span></li>
              <li><span className="font-semibold text-slate-800">Email:</span>{" "}
                <a href="mailto:machado.newrecycle@gmail.com" className="break-all font-bold text-green-700 hover:text-green-800">
                  machado.newrecycle@gmail.com
                </a>
              </li>
              <li><span className="font-semibold text-slate-800">Telefone:</span>{" "}
                <a href="https://wa.me/351968120503" className="font-bold text-green-700 hover:text-green-800">
                  968 120 503
                </a>
              </li>
            </ul>
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
              4. Base legal do tratamento
            </h2>
            <p className="mt-2">
              O tratamento dos dados tem por base: (a) a execução do contrato
              de compra e venda ou de prestação de serviços; (b) o cumprimento
              de obrigações legais, nomeadamente fiscais e contabilísticas;
              (c) o consentimento do titular, quando aplicável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              5. Conta de cliente e autenticação
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
              6. Comunicações por email
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
              7. Conservação dos dados
            </h2>
            <p className="mt-2">
              Os dados serão conservados durante o período necessário para tratar
              pedidos, gerir encomendas, prestar apoio ao cliente e cumprir
              obrigações legais, fiscais ou contabilísticas aplicáveis. Em regra,
              os dados de clientes são conservados durante 10 anos para efeitos
              fiscais, nos termos da lei portuguesa. Quando os dados deixarem de
              ser necessários, serão eliminados ou anonimizados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              8. Partilha de dados
            </h2>
            <p className="mt-2">
              Os dados poderão ser tratados por serviços necessários ao
              funcionamento do site, autenticação, alojamento, envio de emails,
              faturação, expedição ou apoio técnico. Apenas serão partilhados os
              dados estritamente necessários para cumprir essas finalidades.
              Os dados não são vendidos nem cedidos a terceiros para fins
              comerciais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              9. Direitos do titular dos dados
            </h2>
            <p className="mt-2">
              Nos termos do RGPD, o titular dos dados pode exercer os seguintes
              direitos, dirigindo o pedido por escrito ao responsável pelo
              tratamento:
            </p>
            <ul className="mt-2 space-y-1 pl-4 text-sm">
              <li>• <strong className="text-slate-800">Acesso</strong> — saber que dados são tratados</li>
              <li>• <strong className="text-slate-800">Rectificação</strong> — corrigir dados inexactos</li>
              <li>• <strong className="text-slate-800">Apagamento</strong> — solicitar a eliminação dos dados</li>
              <li>• <strong className="text-slate-800">Limitação</strong> — limitar o tratamento em determinadas circunstâncias</li>
              <li>• <strong className="text-slate-800">Portabilidade</strong> — receber os dados em formato estruturado</li>
              <li>• <strong className="text-slate-800">Oposição</strong> — opor-se ao tratamento para fins específicos</li>
            </ul>
            <p className="mt-2">
              O exercício destes direitos pode estar limitado quando exista uma
              obrigação legal de conservação dos dados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              10. Autoridade de controlo
            </h2>
            <p className="mt-2">
              Se considerar que o tratamento dos seus dados viola o RGPD, tem o
              direito de apresentar reclamação à autoridade de controlo competente
              em Portugal:
            </p>
            <ul className="mt-2 pl-4">
              <li>
                <span className="font-semibold text-slate-800">CNPD</span> —
                Comissão Nacional de Protecção de Dados:{" "}
                <a
                  href="https://www.cnpd.pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-green-700 hover:text-green-800"
                >
                  www.cnpd.pt
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              11. Contacto
            </h2>
            <p className="mt-2">
              Para questões sobre privacidade e tratamento de dados, ou para
              exercer os seus direitos, contacte o responsável pelo tratamento
              através do email{" "}
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
