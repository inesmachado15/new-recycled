import { NextResponse } from "next/server";
import {
  autenticarKeyInvoice,
  chamarMetodoKeyInvoice,
} from "@/lib/keyinvoice";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nome = searchParams.get("nome") || "";
    const id = searchParams.get("id") || "";

    const sid = await autenticarKeyInvoice();

    const body: Record<string, unknown> = {
      method: "listProducts",
      Offset: 0,
    };

    if (nome) {
      body.Name = nome;
    }

    if (id) {
      body.IdProduct = id;
    }

    const produtos = await chamarMetodoKeyInvoice(sid, body);

    return NextResponse.json({
      success: true,
      pesquisa: {
        nome,
        id,
      },
      produtos: produtos.Data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido no KeyInvoice.";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}