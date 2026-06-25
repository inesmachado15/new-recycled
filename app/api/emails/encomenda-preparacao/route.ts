import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  enviarEmail,
  formatarDataEmail,
  formatarPrecoEmail,
} from "@/lib/email";

type OrderItem = {
  product_name: string;
  product_reference: string | null;
  product_brand: string | null;
  quantity: number;
  price_text: string | null;
};

type OrderData = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_type: string;
  company_name: string | null;
  nif: string | null;
  address: string;
  postal_code: string;
  city: string;
  delivery_preference: string;
  payment_preference: string;
  payment_status: string | null;
  status: string;
  subtotal_products: number | null;
  shipping_cost: number | null;
  total_amount: number | null;
  total_estimated: number | null;
  preparation_email_sent_at: string | null;
  preparation_email_sending_at: string | null;
  order_items: OrderItem[];
};

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

function criarListaProdutosHtml(items: OrderItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
            <strong>${item.quantity}x ${item.product_name}</strong><br />
            <span style="color: #64748b; font-size: 13px;">
              Ref.: ${item.product_reference || "Sem referência"} · Marca: ${
        item.product_brand || "Sem marca"
      }
            </span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${item.price_text || "Sob consulta"}
          </td>
        </tr>
      `
    )
    .join("");
}

function emailClienteHtml(order: OrderData) {
  const total = order.total_amount || order.total_estimated || 0;

  const portes =
    order.shipping_cost === null || order.shipping_cost === undefined
      ? "Sob consulta"
      : order.shipping_cost === 0
      ? "Grátis"
      : formatarPrecoEmail(order.shipping_cost);

  return `
    <div style="font-family: Arial, sans-serif; background: #f4f8f3; padding: 24px;">
      <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 28px; border: 1px solid #e5e7eb;">
        <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.18em; color: #15803d; text-transform: uppercase;">
          New & Recycled
        </p>

        <h1 style="margin: 12px 0 0; font-size: 28px; color: #0f172a;">
          A sua encomenda está em preparação
        </h1>

        <p style="font-size: 15px; line-height: 1.7; color: #475569;">
          Olá ${order.customer_name},
        </p>

        <p style="font-size: 15px; line-height: 1.7; color: #475569;">
          Confirmamos que a sua encomenda já se encontra em preparação. Estamos a tratar dos produtos para que o envio seja realizado assim que possível.
        </p>

        <div style="background: #f8fafc; border-radius: 16px; padding: 16px; margin-top: 20px;">
          <p style="margin: 0; color: #0f172a;">
            <strong>Nº da encomenda:</strong> ${order.id}
          </p>

          <p style="margin: 8px 0 0; color: #0f172a;">
            <strong>Data:</strong> ${formatarDataEmail(order.created_at)}
          </p>

          <p style="margin: 8px 0 0; color: #0f172a;">
            <strong>Estado:</strong> ${order.status}
          </p>

          <p style="margin: 8px 0 0; color: #0f172a;">
            <strong>Pagamento:</strong> ${order.payment_status || "Pendente"}
          </p>
        </div>

        <h2 style="font-size: 18px; margin-top: 28px; color: #0f172a;">
          Produtos
        </h2>

        <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
          ${criarListaProdutosHtml(order.order_items)}
        </table>

        <div style="margin-top: 22px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <p style="margin: 0; color: #475569;">
            Produtos:
            <strong style="float: right; color: #0f172a;">
              ${formatarPrecoEmail(order.subtotal_products)}
            </strong>
          </p>

          <p style="margin: 10px 0 0; color: #475569;">
            Portes:
            <strong style="float: right; color: #0f172a;">
              ${portes}
            </strong>
          </p>

          <p style="margin: 16px 0 0; font-size: 18px; color: #0f172a;">
            Total:
            <strong style="float: right;">
              ${formatarPrecoEmail(total)}
            </strong>
          </p>
        </div>

        <h2 style="font-size: 18px; margin-top: 28px; color: #0f172a;">
          Entrega
        </h2>

        <p style="font-size: 14px; line-height: 1.7; color: #475569;">
          ${order.address}<br />
          ${order.postal_code} ${order.city}<br />
          ${order.delivery_preference}
        </p>

        <div style="background: #eff6ff; border-radius: 16px; padding: 16px; margin-top: 24px; border: 1px solid #bfdbfe;">
          <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.7;">
            Assim que a encomenda for enviada, receberá um novo email com a confirmação de envio e os dados de acompanhamento, caso estejam disponíveis.
          </p>
        </div>

        <p style="margin-top: 28px; font-size: 13px; line-height: 1.6; color: #64748b;">
          Obrigado pela preferência.<br />
          New & Recycled
        </p>
      </div>
    </div>
  `;
}

function emailClienteTexto(order: OrderData) {
  const total = order.total_amount || order.total_estimated || 0;

  return `Olá ${order.customer_name},

A sua encomenda já se encontra em preparação.

Nº da encomenda: ${order.id}
Data: ${formatarDataEmail(order.created_at)}
Estado: ${order.status}
Pagamento: ${order.payment_status || "Pendente"}

Total: ${formatarPrecoEmail(total)}

Assim que a encomenda for enviada, receberá um novo email com a confirmação de envio e os dados de acompanhamento, caso estejam disponíveis.

Obrigado pela preferência.

New & Recycled`;
}

async function obterEncomenda(orderId: string) {
  const supabaseAdmin = criarSupabaseAdmin();

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select(
      `
      id,
      created_at,
      customer_name,
      customer_email,
      customer_phone,
      customer_type,
      company_name,
      nif,
      address,
      postal_code,
      city,
      delivery_preference,
      payment_preference,
      payment_status,
      status,
      subtotal_products,
      shipping_cost,
      total_amount,
      total_estimated,
      preparation_email_sent_at,
      preparation_email_sending_at,
      order_items (
        product_name,
        product_reference,
        product_brand,
        quantity,
        price_text
      )
    `
    )
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw new Error(
      `Encomenda não encontrada: ${orderError?.message || "sem dados"}`
    );
  }

  return order as OrderData;
}

async function bloquearEnvioEmailPreparacao(orderId: string) {
  const supabaseAdmin = criarSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({
      preparation_email_sending_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .is("preparation_email_sent_at", null)
    .is("preparation_email_sending_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Erro ao bloquear envio do email de preparação: ${error.message}`
    );
  }

  return Boolean(data?.id);
}

async function marcarEmailPreparacaoComoEnviado(orderId: string) {
  const supabaseAdmin = criarSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      preparation_email_sent_at: new Date().toISOString(),
      preparation_email_sending_at: null,
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(
      `Email enviado, mas não foi possível marcar como enviado: ${error.message}`
    );
  }
}

async function libertarBloqueioEmailPreparacao(orderId: string) {
  const supabaseAdmin = criarSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      preparation_email_sending_at: null,
    })
    .eq("id", orderId);

  if (error) {
    console.error("Erro ao libertar bloqueio do email de preparação:", error);
  }
}

export async function POST(request: Request) {
  let orderIdParaDesbloquear: string | null = null;

  try {
    const body = await request.json();
    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId é obrigatório." },
        { status: 400 }
      );
    }

    const orderData = await obterEncomenda(String(orderId));

    if (orderData.preparation_email_sent_at) {
      return NextResponse.json({
        success: true,
        alreadySent: true,
        message: "O email de preparação já tinha sido enviado anteriormente.",
      });
    }

    if (orderData.preparation_email_sending_at) {
      return NextResponse.json({
        success: false,
        alreadySending: true,
        error:
          "O email de preparação já está a ser enviado. Aguarda alguns segundos antes de tentar novamente.",
      });
    }

    if (!orderData.customer_email) {
      return NextResponse.json(
        {
          success: false,
          error: "A encomenda não tem email do cliente.",
        },
        { status: 400 }
      );
    }

    if (
      orderData.status !== "Em preparação" &&
      orderData.status !== "Enviado" &&
      orderData.status !== "Entregue"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "O email de preparação só pode ser enviado quando a encomenda está em preparação ou num estado posterior.",
        },
        { status: 400 }
      );
    }

    if (orderData.payment_status !== "Pago") {
      return NextResponse.json(
        {
          success: false,
          error:
            "O email de preparação só deve ser enviado depois do pagamento estar confirmado.",
        },
        { status: 400 }
      );
    }

    const bloqueioCriado = await bloquearEnvioEmailPreparacao(orderData.id);

    if (!bloqueioCriado) {
      return NextResponse.json({
        success: false,
        alreadySending: true,
        error:
          "O email de preparação já foi enviado ou já está em envio. Não foi enviado novamente.",
      });
    }

    orderIdParaDesbloquear = orderData.id;

    const clienteEmail = await enviarEmail({
      to: orderData.customer_email,
      subject: "A sua encomenda está em preparação — New & Recycled",
      html: emailClienteHtml(orderData),
      text: emailClienteTexto(orderData),
    });

    await marcarEmailPreparacaoComoEnviado(orderData.id);

    orderIdParaDesbloquear = null;

    return NextResponse.json({
      success: true,
      message: "Email de preparação enviado por Gmail.",
      clienteEmail,
    });
  } catch (error) {
    if (orderIdParaDesbloquear) {
      await libertarBloqueioEmailPreparacao(orderIdParaDesbloquear);
    }

    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao enviar email de preparação.";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}