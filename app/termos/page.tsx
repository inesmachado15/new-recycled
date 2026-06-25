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
              1. Funcionamento das encomendas
            </h2>
            <p className="mt-2">
              Os pedidos efetuados através do site não constituem confirmação
              automática de compra. Após o envio do pedido, a New & Recycled
              valida a disponibilidade dos produtos, confirma os portes
              aplicáveis e comunica ao cliente os dados necessários para
              pagamento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              2. Conta de cliente
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
              3. Preços e stock
            </h2>
            <p className="mt-2">
              Os preços apresentados no site podem estar sujeitos a confirmação,
              especialmente em produtos com preço sob consulta ou dependentes de
              disponibilidade de fornecedor. A indicação de stock no site é
              meramente informativa e pode ser atualizada durante a validação da
              encomenda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              4. Produtos sob consulta
            </h2>
            <p className="mt-2">
              Produtos assinalados como “sob consulta” não podem ser pagos
              automaticamente através do site. O preço, disponibilidade e
              condições de fornecimento serão confirmados diretamente com o
              cliente antes da encomenda avançar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              5. Pagamento
            </h2>
            <p className="mt-2">
              O pagamento só deverá ser efetuado após a aprovação da encomenda
              pela New & Recycled. Nesta fase, o site não processa pagamentos
              automáticos. Os dados de pagamento são comunicados ao cliente
              depois da validação da encomenda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              6. Entregas e portes
            </h2>
            <p className="mt-2">
              As condições de entrega, prazos e custos de envio são confirmados
              antes da conclusão da encomenda. Toners e tinteiros têm portes de
              3,75€, com portes gratuitos em compras iguais ou superiores a 60€.
              Outros produtos ficam sujeitos a portes sob consulta, devido ao
              peso, volume ou características da encomenda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              7. Faturação
            </h2>
            <p className="mt-2">
              Quando aplicável, será emitido documento comercial ou fiscal com
              base nos dados fornecidos pelo cliente. O cliente é responsável por
              garantir que os dados de faturação, incluindo nome, morada e NIF,
              estão corretos antes de finalizar a encomenda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              8. Cancelamentos
            </h2>
            <p className="mt-2">
              A New & Recycled poderá cancelar ou não aprovar uma encomenda caso
              não exista disponibilidade de produto, caso os dados fornecidos
              estejam incompletos, caso exista erro evidente de preço ou caso não
              seja possível confirmar as condições comerciais com o cliente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              9. Trocas e devoluções
            </h2>
            <p className="mt-2">
              As trocas e devoluções são analisadas de acordo com o tipo de
              produto, o estado da embalagem, o motivo do pedido e a legislação
              aplicável. O cliente deverá contactar a New & Recycled com a maior
              brevidade possível caso receba um produto errado, danificado ou
              incompatível.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              10. Contacto
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
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}