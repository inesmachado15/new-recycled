import { NextResponse } from "next/server";
import {
  autenticarKeyInvoice,
  chamarMetodoKeyInvoice,
} from "@/lib/keyinvoice";

export async function GET() {
  try {
    const sid = await autenticarKeyInvoice();

    const taxas = await chamarMetodoKeyInvoice(sid, {
      method: "getTaxes",
    });

    const pagamentos = await chamarMetodoKeyInvoice(sid, {
      method: "listPaymentMethods",
    });

    const seriesFaturaRecibo = await chamarMetodoKeyInvoice(sid, {
      method: "listDocumentSeries",
      DocType: 34,
    });

    return NextResponse.json({
      success: true,
      taxas: taxas.Data,
      pagamentos: pagamentos.Data,
      seriesFaturaRecibo: seriesFaturaRecibo.Data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido no KeyInvoice.";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}