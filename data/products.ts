import produtosJson from "./products.json";

export type Product = {
  id: string;
  nome: string;
  categoria: string;
  preco: number | null;
  precoTexto: string;
  estado: string;
  referencia: string;
  marca: string;
  imagem: string;
  descricao: string;
  compatibilidade: string;
};

export const products = produtosJson as Product[];