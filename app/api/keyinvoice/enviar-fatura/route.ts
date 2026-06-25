import { NextResponse } from "next/server";
import {
  autenticarKeyInvoice,
  chamarMetodoKeyInvoice,
} from "@/lib/keyinvoice";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const docType = body.docType;
    const docSeries = body.docSeries;
    const docNum = body.docNum;
    const email = body.email;
    const customerName = body.customerName || "Cliente";

    if (!docType || !docNum || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "docType, docNum e email são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const sid = await autenticarKeyInvoice();

    const resultadoKeyInvoice = await chamarMetodoKeyInvoice(sid, {
      method: "sendDocumentPDF2Email",
      DocType: String(docType),
      DocSeries: docSeries ? String(docSeries) : undefined,
      DocNum: String(docNum),
      EmailDestinations: String(email),
      EmailSubject: "Fatura-Recibo — New & Recycled",
      EmailBody: `Olá ${customerName},

Segue em anexo a Fatura-Recibo da sua encomenda New & Recycled.

Obrigado pela preferência.

New & Recycled`,
      Signed: "1",
    });

    return NextResponse.json({
      success: true,
      message: "Fatura-recibo enviada por email através do KeyInvoice.",
      keyinvoice: resultadoKeyInvoice.Data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao enviar fatura-recibo.";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}