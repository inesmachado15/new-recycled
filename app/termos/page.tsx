import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos e Condições",
  description:
    "Termos e condições de utilização do site e de compra na New & Recycled — identificação do titular, condições de encomenda, pagamento, entrega, devoluções e centro de arbitragem.",
};

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
          Informação legal
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Termos e Condições
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Última actualização: Junho de 2026
        </p>

        <div className="mt-8 space-y-6 leading-7 text-slate-600">
          <p>
            A utilização deste site e o envio de pedidos de encomenda pressupõem
            o conhecimento e aceitação dos presentes termos e condições. A New &
            Recycled comercializa produtos de escritório, consumíveis,
            tinteiros, toners, papel, rolos térmicos e outros artigos
            relacionados.
          </p>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              1. Identificação do titular
            </h2>
            <p className="mt-2">
              O presente site é operado por:
            </p>
            <ul className="mt-2 space-y-1 pl-4">
              <li><span className="font-semibold text-slate-800">Nome:</span> José Carlos Macedo Machado</li>
              <li><span className="font-semibold text-slate-800">NIF:</span> 164366423</li>
              <li><span className="font-semibold text-slate-800">Morada:</span> Rua Bernardino Machado, nº 119, São Domingos de Rana</li>
              <li><span className="font-semibold text-slate-800">Telefone / WhatsApp:</span>{" "}
                <a href="https://wa.me/351968120503" className="font-bold text-green-700 hover:text-green-800">
                  968 120 503
                </a>
              </li>
              <li><span className="font-semibold text-slate-800">Email:</span>{" "}
                <a href="mailto:machado.newrecycle@gmail.com" className="break-all font-bold text-green-700 hover:text-green-800">
                  machado.newrecycle@gmail.com
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              2. Funcionamento das encomendas
            </h2>
            <p className="mt-2">
              Os pedidos efectuados através do site implicam pagamento imediato no checkout. Após confirmação do pagamento, a New & Recycled processa a encomenda e procede ao envio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              3. Conta de cliente
            </h2>
            <p className="mt-2">
              Para finalizar uma encomenda é necessário iniciar sessão ou criar
              conta. A conta permite acompanhar o estado da encomenda, consultar
              dados de pagamento, aceder ao histórico de pedidos e submeter
              pedidos de devolução quando aplicável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              4. Preços e stock
            </h2>
            <p className="mt-2">
              Os preços apresentados no site incluem IVA à taxa legal em vigor.
              Os preços podem estar sujeitos a confirmação, especialmente em
              produtos com preço sob consulta ou dependentes de disponibilidade
              de fornecedor. A indicação de stock no site é meramente informativa
              e pode ser actualizada durante a validação da encomenda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              5. Produtos sob consulta
            </h2>
            <p className="mt-2">
              Produtos assinalados como "sob consulta" não podem ser pagos
              automaticamente através do site. O preço, disponibilidade e
              condições de fornecimento serão confirmados directamente com o
              cliente antes da encomenda avançar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              6. Pagamento
            </h2>
            <p className="mt-2">
              O pagamento é efectuado no momento da encomenda, de forma segura, através dos métodos disponibilizados no site (Referência Multibanco ou MB WAY). O site não recolhe nem armazena dados de cartão de crédito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              7. Entregas e portes
            </h2>
            <p className="mt-2">
              Os portes de envio são fixos em 3,75€ para todo o Portugal continental. Compras iguais ou superiores a 60€ beneficiam de portes gratuitos. O prazo de entrega habitual é de 2 a 5 dias úteis após confirmação do pagamento, podendo variar conforme a disponibilidade do produto.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              8. Faturação
            </h2>
            <p className="mt-2">
              Quando aplicável, será emitido documento comercial ou fiscal com
              base nos dados fornecidos pelo cliente. O cliente é responsável por
              garantir que os dados de faturação, incluindo nome, morada e NIF,
              estão correctos antes de finalizar a encomenda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              9. Direito de livre resolução
            </h2>
            <p className="mt-2">
              Nos termos do Decreto-Lei n.º 24/2014, de 14 de Fevereiro, o
              consumidor tem o direito de resolver o contrato celebrado à
              distância sem necessidade de indicar o motivo, no prazo de{" "}
              <strong className="text-slate-800">14 dias</strong> a contar da
              data de recepção do bem. Para exercer este direito, o cliente deve
              contactar a New & Recycled por escrito dentro do prazo indicado.
            </p>
            <p className="mt-2">
              Exceptuam-se deste direito os bens susceptíveis de se deteriorarem
              ou ficarem fora de prazo, bens selados que não possam ser devolvidos
              por razões de protecção da saúde ou de higiene, e bens que após a
              entrega e pela sua natureza estejam inseparáveis de outros bens.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              10. Cancelamentos
            </h2>
            <p className="mt-2">
              A New & Recycled poderá cancelar uma encomenda e proceder ao reembolso caso não exista disponibilidade de produto, caso os dados fornecidos estejam incompletos ou caso exista erro evidente de preço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              11. Resolução alternativa de litígios
            </h2>
            <p className="mt-2">
              Em caso de litígio, o consumidor pode recorrer a uma entidade de
              resolução alternativa de litígios de consumo:
            </p>
            <ul className="mt-2 space-y-2 pl-4">
              <li>
                <span className="font-semibold text-slate-800">CNIACC</span> —
                Centro Nacional de Informação e Arbitragem de Conflitos de
                Consumo:{" "}
                <a
                  href="https://www.cniacc.pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-green-700 hover:text-green-800"
                >
                  www.cniacc.pt
                </a>
              </li>
              <li>
                <span className="font-semibold text-slate-800">Portal do Consumidor:</span>{" "}
                <a
                  href="https://www.consumidor.gov.pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-green-700 hover:text-green-800"
                >
                  www.consumidor.gov.pt
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              12. Lei aplicável
            </h2>
            <p className="mt-2">
              Os presentes termos e condições são regidos pela lei portuguesa.
              Em caso de litígio, é competente o tribunal da comarca da morada
              do consumidor, sem prejuízo do recurso à resolução alternativa de
              litígios prevista na cláusula anterior.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              13. Contacto
            </h2>
            <p className="mt-2">
              Para qualquer dúvida relacionada com produtos, encomendas,
              pagamentos, envios ou condições comerciais, contacte a New &
              Recycled através do email{" "}
              <a
                href="mailto:machado.newrecycle@gmail.com"
                className="break-all font-bold text-green-700 hover:text-green-800"
              >
                machado.newrecycle@gmail.com
              </a>{" "}
              ou pelo telefone{" "}
              <a href="https://wa.me/351968120503" className="font-bold text-green-700 hover:text-green-800">
                968 120 503
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
