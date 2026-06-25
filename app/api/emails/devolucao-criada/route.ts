import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  enviarEmail,
  formatarDataEmail,
  formatarPrecoEmail,
  getAdminOrderEmail,
} from "@/lib/email";

type DevolucaoData = {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  details: string | null;
  status: string;
  requested_at: string;
  orders:
    | {
        id: string;
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        customer_type: string;
        company_name: string | null;
        nif: string | null;
        status: string;
        payment_status: string | null;
        total_amount: number | null;
        total_estimated: number | null;
        created_at: string;
      }
    | {
        id: string;
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        customer_type: string;
        company_name: string | null;
        nif: string | null;
        status: string;
        payment_status: string | null;
        total_amount: number | null;
        total_estimated: number | null;
        created_at: string;
      }[]
    | null;
};

function normalizarOrder(order: DevolucaoData["orders"]) {
  if (Array.isArray(order)) return order[0] || null;
  return order;
}

function emailAdminHtml(devolucao: DevolucaoData) {
  const order = normalizarOrder(devolucao.orders);
  const total = order?.total_amount || order?.total_estimated || 0;

  return `
    <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 24px;">
      <div style="max-width: 760px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 28px; border: 1px solid #e5e7eb;">
        <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.18em; color: #b45309; text-transform: uppercase;">
          Pedido de devolução
        </p>

        <h1 style="margin: 12px 0 0; font-size: 28px; color: #0f172a;">
          Novo pedido de devolução
        </h1>

        <p style="font-size: 15px; line-height: 1.7; color: #475569;">
          Foi criado um novo pedido de devolução no site New & Recycled.
        </p>

        <div style="background: #fffbeb; border-radius: 16px; padding: 16px; margin-top: 20px; border: 1px solid #fde68a;">
          <p style="margin: 0;"><strong>Pedido:</strong> ${devolucao.id}</p>
          <p style="margin: 8px 0 0;"><strong>Encomenda:</strong> ${devolucao.order_id}</p>
          <p style="margin: 8px 0 0;"><strong>Data do pedido:</strong> ${formatarDataEmail(
            devolucao.requested_at
          )}</p>
          <p style="margin: 8px 0 0;"><strong>Estado:</strong> ${devolucao.status}</p>
        </div>

        <h2 style="font-size: 18px; margin-top: 28px; color: #0f172a;">
          Motivo da devolução
        </h2>

        <p style="font-size: 14px; line-height: 1.7; color: #475569;">
          <strong>Motivo:</strong> ${devolucao.reason}<br />
          <strong>Descrição:</strong> ${devolucao.details || "Sem descrição adicional"}
        </p>

        <h2 style="font-size: 18px; margin-top: 28px; color: #0f172a;">
          Cliente
        </h2>

        <p style="font-size: 14px; line-height: 1.7; color: #475569;">
          <strong>Nome:</strong> ${order?.customer_name || "Não indicado"}<br />
          <strong>Email:</strong> ${order?.customer_email || "Não indicado"}<br />
          <strong>Telefone:</strong> ${order?.customer_phone || "Não indicado"}<br />
          <strong>Tipo:</strong> ${order?.customer_type || "Não indicado"}<br />
          <strong>Empresa:</strong> ${order?.company_name || "Não indicado"}<br />
          <strong>NIF:</strong> ${order?.nif || "Não indicado"}
        </p>

        <h2 style="font-size: 18px; margin-top: 28px; color: #0f172a;">
          Encomenda
        </h2>

        <p style="font-size: 14px; line-height: 1.7; color: #475569;">
          <strong>Data da encomenda:</strong> ${formatarDataEmail(order?.created_at)}<br />
          <strong>Estado da encomenda:</strong> ${order?.status || "Não indicado"}<br />
          <strong>Estado do pagamento:</strong> ${order?.payment_status || "Não indicado"}<br />
          <strong>Total:</strong> ${formatarPrecoEmail(total)}
        </p>

        <p style="margin-top: 28px; font-size: 13px; line-height: 1.6; color: #64748b;">
          A devolução pode ser analisada no painel de administração, em Admin → Devoluções.
        </p>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const returnRequestId = body.returnRequestId;

    if (!returnRequestId) {
      return NextResponse.json(
        { error: "returnRequestId é obrigatório." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            "NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não estão definidos.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: devolucao, error: devolucaoError } = await supabaseAdmin
      .from("return_requests")
      .select(
        `
        id,
        order_id,
        user_id,
        reason,
        details,
        status,
        requested_at,
        orders (
          id,
          customer_name,
          customer_email,
          customer_phone,
          customer_type,
          company_name,
          nif,
          status,
          payment_status,
          total_amount,
          total_estimated,
          created_at
        )
      `
      )
      .eq("id", returnRequestId)
      .single();

    if (devolucaoError || !devolucao) {
      return NextResponse.json(
        {
          error: `Pedido de devolução não encontrado: ${
            devolucaoError?.message || "sem dados"
          }`,
        },
        { status: 404 }
      );
    }

    const devolucaoData = devolucao as DevolucaoData;

    const emailResult = await enviarEmail({
      to: getAdminOrderEmail(),
      subject: `Novo pedido de devolução — ${devolucaoData.reason}`,
      html: emailAdminHtml(devolucaoData),
    });

    return NextResponse.json({
      success: true,
      email: emailResult,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao enviar email.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}