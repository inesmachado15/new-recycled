import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  autenticarKeyInvoice,
  chamarMetodoKeyInvoice,
} from "@/lib/keyinvoice";
import { enviarEmail } from "@/lib/email";

function criarSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não estão definidos."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function normalizarPdfBase64(documentBinary: unknown) {
  if (typeof documentBinary !== "string") {
    throw new Error("O KeyInvoice não devolveu o PDF em formato válido.");
  }

  if (documentBinary.startsWith("data:application/pdf;base64,")) {
    return documentBinary.replace("data:application/pdf;base64,", "");
  }

  return documentBinary;
}

async function marcarFaturaComoEnviada(orderId: string) {
  const supabaseAdmin = criarSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      keyinvoice_invoice_sent_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(
      `Email enviado, mas não foi possível guardar a data de envio da fatura no Supabase: ${error.message}`
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const orderId = body.orderId;
    const docType = body.docType;
    const docSeries = body.docSeries;
    const docNum = body.docNum;
    const email = body.email;
    const customerName = body.customerName || "Cliente";
    const fullDocNumber =
      body.fullDocNumber || `${docType} ${docSeries}/${docNum}`;

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

    const pdfResponse = await chamarMetodoKeyInvoice(sid, {
      method: "getDocumentPDF",
      DocType: String(docType),
      DocSeries: docSeries ? String(docSeries) : undefined,
      DocNum: String(docNum),
      Format: "A4",
    });

    const data = pdfResponse.Data as { DocumentBinary?: unknown } | undefined;
    const pdfBase64 = normalizarPdfBase64(data?.DocumentBinary);

    const filename = `Fatura-Recibo-${String(fullDocNumber)
      .replaceAll("/", "-")
      .replaceAll(" ", "-")}.pdf`;

    const emailResult = await enviarEmail({
      to: String(email),
      subject: "Fatura-Recibo — New & Recycled",
      html: `
        <div style="font-family: Arial, sans-serif; background: #f4f8f3; padding: 24px;">
          <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 28px; border: 1px solid #e5e7eb;">
            <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.18em; color: #15803d; text-transform: uppercase;">
              New & Recycled
            </p>

            <h1 style="margin: 12px 0 0; font-size: 26px; color: #0f172a;">
              Fatura-Recibo
            </h1>

            <p style="font-size: 15px; line-height: 1.7; color: #475569;">
              Olá ${customerName},
            </p>

            <p style="font-size: 15px; line-height: 1.7; color: #475569;">
              Segue em anexo a Fatura-Recibo relativa à sua encomenda New & Recycled.
            </p>

            <div style="background: #f8fafc; border-radius: 16px; padding: 16px; margin-top: 20px;">
              <p style="margin: 0; color: #0f172a;">
                <strong>Documento:</strong> ${fullDocNumber}
              </p>
            </div>

            <p style="margin-top: 28px; font-size: 13px; line-height: 1.6; color: #64748b;">
              Obrigado pela preferência.
            </p>
          </div>
        </div>
      `,
      text: `Olá ${customerName},

Segue em anexo a Fatura-Recibo relativa à sua encomenda New & Recycled.

Documento: ${fullDocNumber}

Obrigado pela preferência.

New & Recycled`,
      attachments: [
        {
          filename,
          content: pdfBase64,
          encoding: "base64",
          contentType: "application/pdf",
        },
      ],
    });

    if (orderId) {
      await marcarFaturaComoEnviada(String(orderId));
    }

    return NextResponse.json({
      success: true,
      message: "Fatura-recibo enviada por Gmail com PDF oficial do KeyInvoice.",
      email: emailResult,
      document: {
        orderId,
        docType,
        docSeries,
        docNum,
        fullDocNumber,
        filename,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao enviar fatura-recibo por Gmail.";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}