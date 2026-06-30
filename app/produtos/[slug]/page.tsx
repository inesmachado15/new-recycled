import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import AddToCartButton from "./AddToCartButton";

type Produto = {
  id: string;
  slug: string;
  sku: string | null;
  name: string;
  category: string;
  brand: string | null;
  reference: string | null;
  description: string | null;
  compatibility: string | null;
  image_url: string | null;
  price: number | null;
  price_text: string | null;
  stock: number;
  min_stock: number;
  active: boolean;
  featured: boolean;
  allow_backorder: boolean;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("products")
    .select("name,description,brand,category,image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Produto não encontrado" };

  const title = data.name;
  const description =
    data.description?.slice(0, 160) ||
    `${data.brand ? data.brand + " — " : ""}${data.category} disponível na New & Recycled.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: data.image_url ? [{ url: data.image_url }] : [],
    },
  };
}

function formatarPreco(produto: Produto) {
  if (produto.price_text) return produto.price_text;
  if (produto.price === null) return "Sob consulta";
  return `${Number(produto.price).toFixed(2).replace(".", ",")}€`;
}

export default async function ProdutoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("products")
    .select(
      "id,slug,sku,name,category,brand,reference,description,compatibility,image_url,price,price_text,stock,min_stock,active,featured,allow_backorder"
    )
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const produto = data as Produto;
  const disponivel = produto.active && (produto.stock > 0 || produto.allow_backorder);
  const emStock = produto.stock > 0;
  const semPreco = produto.price === null;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/produtos" className="font-bold text-green-700 hover:text-green-800">
            Catálogo
          </Link>
          <span>/</span>
          <Link
            href={`/produtos?categoria=${encodeURIComponent(produto.category)}`}
            className="hover:text-slate-900"
          >
            {produto.category}
          </Link>
          {produto.brand && (
            <>
              <span>/</span>
              <Link
                href={`/produtos?marca=${encodeURIComponent(produto.brand)}`}
                className="hover:text-slate-900"
              >
                {produto.brand}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="line-clamp-1 text-slate-900">{produto.name}</span>
        </nav>

        <section className="mt-8 grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[440px_1fr]">
          <div className="rounded-3xl bg-slate-50 p-6">
            <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-100 bg-white p-6">
              {produto.image_url ? (
                <Image
                  src={produto.image_url}
                  alt={produto.name}
                  width={340}
                  height={340}
                  className="max-h-[340px] w-full object-contain"
                  priority
                />
              ) : (
                <div className="flex h-[300px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 text-center text-sm font-bold text-slate-400">
                  Sem imagem
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                {produto.category}
              </span>

              {produto.featured && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  Destaque
                </span>
              )}

              {emStock ? (
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  Em stock
                </span>
              ) : produto.allow_backorder ? (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  Disponível por encomenda
                </span>
              ) : (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                  Indisponível
                </span>
              )}
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              {produto.name}
            </h1>

            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>
                <span className="font-bold text-slate-900">Marca:</span>{" "}
                {produto.brand || "Sem marca"}
              </p>
              <p>
                <span className="font-bold text-slate-900">Referência:</span>{" "}
                {produto.reference || "Sem referência"}
              </p>
              <p>
                <span className="font-bold text-slate-900">SKU:</span>{" "}
                {produto.sku || "Sem SKU"}
              </p>
              <p>
                <span className="font-bold text-slate-900">Stock:</span>{" "}
                {emStock
                  ? `${produto.stock} unidade(s)`
                  : produto.allow_backorder
                  ? "Por encomenda"
                  : "Sem stock"}
              </p>
            </div>

            <div className="mt-8 rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Preço
              </p>
              <p className="mt-2 text-4xl font-black text-slate-950">
                {formatarPreco(produto)}
              </p>
              {semPreco && (
                <p className="mt-2 text-sm text-slate-500">
                  Este produto está sob consulta. Contacte-nos para confirmar o
                  preço antes de encomendar.
                </p>
              )}
            </div>

            <AddToCartButton
              produtoId={produto.id}
              produtoNome={produto.name}
              disponivel={disponivel}
              semPreco={semPreco}
            />

            <Link
              href="/contacto"
              className="mt-3 block rounded-full border border-slate-300 bg-white px-6 py-4 text-center text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
            >
              Pedir informação
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Descrição
            </p>
            <h2 className="mt-3 text-2xl font-black">Detalhes do produto</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
              {produto.description || "Este produto ainda não tem descrição detalhada."}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Compatibilidade
            </p>
            <h2 className="mt-3 text-2xl font-black">Informação técnica</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
              {produto.compatibility ||
                "Não existe informação de compatibilidade disponível para este produto."}
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
