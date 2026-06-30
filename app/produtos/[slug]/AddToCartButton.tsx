"use client";

import { useState } from "react";

type Props = {
  produtoId: string;
  produtoNome: string;
  disponivel: boolean;
  semPreco: boolean;
};

export default function AddToCartButton({
  produtoId,
  produtoNome,
  disponivel,
  semPreco,
}: Props) {
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  function adicionarAoCarrinho() {
    setMensagem("");
    setErro("");

    if (!disponivel) {
      setErro("Este produto não está disponível para encomenda.");
      return;
    }

    if (semPreco) {
      setErro("Este produto ainda não tem preço definido.");
      return;
    }

    let carrinhoAtual: { id: string; quantidade: number }[] = [];

    try {
      carrinhoAtual = JSON.parse(localStorage.getItem("carrinho") || "[]");
    } catch {
      carrinhoAtual = [];
    }

    const itemExistente = carrinhoAtual.find((item) => item.id === produtoId);

    const novoCarrinho = itemExistente
      ? carrinhoAtual.map((item) =>
          item.id === produtoId
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      : [...carrinhoAtual, { id: produtoId, quantidade: 1 }];

    localStorage.setItem("carrinho", JSON.stringify(novoCarrinho));
    window.dispatchEvent(new Event("storage"));

    setMensagem(`"${produtoNome}" foi adicionado ao carrinho.`);
  }

  return (
    <>
      {mensagem && (
        <p className="mt-4 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-800">
          {mensagem}
        </p>
      )}
      {erro && (
        <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
          {erro}
        </p>
      )}
      <button
        type="button"
        onClick={adicionarAoCarrinho}
        disabled={!disponivel || semPreco}
        className="mt-6 w-full rounded-full bg-green-700 px-6 py-4 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {semPreco ? "Sob consulta" : disponivel ? "Adicionar ao carrinho" : "Indisponível"}
      </button>
    </>
  );
}
