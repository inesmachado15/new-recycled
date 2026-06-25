export default function DevolucoesPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
          Informação legal
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Trocas e Devoluções
        </h1>

        <div className="mt-8 space-y-6 leading-7 text-slate-600">
          <p>
            As trocas e devoluções são analisadas pela New & Recycled tendo em
            conta o tipo de produto, o estado da embalagem, o motivo do pedido e
            a legislação aplicável. Para acelerar a análise, o cliente deve
            indicar sempre o número da encomenda e enviar uma descrição clara da
            situação.
          </p>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              1. Antes de encomendar
            </h2>
            <p className="mt-2">
              Antes de encomendar toners, tinteiros ou outros consumíveis,
              recomenda-se confirmar a referência do produto e a compatibilidade
              com o equipamento. Caso tenha dúvidas, deve contactar a New &
              Recycled antes de finalizar a encomenda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              2. Produto incompatível
            </h2>
            <p className="mt-2">
              Se o produto recebido não for compatível com o equipamento, a
              situação será analisada com base na informação fornecida no pedido
              e no estado do produto. A abertura da embalagem, remoção de selos
              ou utilização do produto pode limitar ou impedir a troca.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              3. Produto errado
            </h2>
            <p className="mt-2">
              Caso receba um produto diferente do encomendado, deve contactar a
              New & Recycled com a maior brevidade possível, indicando o número
              da encomenda, fotografias do produto recebido e uma descrição da
              divergência. Após validação, será indicada a solução aplicável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              4. Produto danificado
            </h2>
            <p className="mt-2">
              Se a encomenda chegar danificada, o cliente deve guardar a
              embalagem exterior, a embalagem do produto e tirar fotografias
              visíveis dos danos. O contacto deve ser feito logo que possível
              para permitir a análise da situação junto da transportadora ou do
              fornecedor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              5. Estado da embalagem
            </h2>
            <p className="mt-2">
              Sempre que aplicável, os produtos devem ser devolvidos completos,
              sem sinais de utilização indevida e com a embalagem original. Em
              consumíveis, como toners e tinteiros, a embalagem aberta ou o
              produto utilizado pode impedir a troca ou devolução, exceto quando
              exista defeito confirmado ou erro imputável à New & Recycled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              6. Custos de envio da devolução
            </h2>
            <p className="mt-2">
              Quando a troca ou devolução resulte de erro da New & Recycled ou
              de produto danificado/defeituoso confirmado, as condições de envio
              serão indicadas ao cliente após análise. Nos restantes casos, os
              custos de envio associados à devolução poderão ficar a cargo do
              cliente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              7. Como pedir uma devolução
            </h2>
            <p className="mt-2">
              O pedido pode ser feito através da área de cliente, quando a
              encomenda estiver marcada como entregue, ou através dos contactos
              indicados no site. O cliente deve indicar o motivo da devolução,
              anexar fotografias sempre que necessário e aguardar a análise da
              equipa antes de enviar qualquer produto.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              8. Contacto
            </h2>
            <p className="mt-2">
              Para pedidos de troca ou devolução, contacte a New & Recycled
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