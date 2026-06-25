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
  shipping_carrier: string | null;
  tracking_code: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  shipping_email_sent_at: string | null;
  shipping_email_sending_at: string | null;
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

  const temTracking = order.tracking_code || order.tracking_url;

  return `
    <div style="font-family: Arial, sans-serif; background: #f4f8f3; padding: 24px;">
      <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 28px; border: 1px solid #e5e7eb;">
        <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.18em; color: #15803d; text-transform: uppercase;">
          New & Recycled
        </p>

        <h1 style="margin: 12px 0 0; font-size: 28px; color: #0f172a;">
          A sua encomenda foi enviada
        </h1>

        <p style="font-size: 15px; line-height: 1.7; color: #475569;">
          Olá ${order.customer_name},
        </p>

        <p style="font-size: 15px; line-height: 1.7; color: #475569;">
          A sua encomenda já foi enviada. Pode consultar abaixo os dados principais do envio.
        </p>

        <div style="background: #f8fafc; border-radius: 16px; padding: 16px; margin-top: 20px;">
          <p style="margin: 0; color: #0f172a;">
            <strong>Nº da encomenda:</strong> ${order.id}
          </p>

          <p style="margin: 8px 0 0; color: #0f172a;">
            <strong>Data da encomenda:</strong> ${formatarDataEmail(order.created_at)}
          </p>

          <p style="margin: 8px 0 0; color: #0f172a;">
            <strong>Estado:</strong> ${order.status}
          </p>

          <p style="margin: 8px 0 0; color: #0f172a;">
            <strong>Pagamento:</strong> ${order.payment_status || "Pendente"}
          </p>
        </div>

        <h2 style="font-size: 18px; margin-top: 28px; color: #0f172a;">
          Dados de envio
        </h2>

        <div style="background: #eff6ff; border-radius: 16px; padding: 16px; border: 1px solid #bfdbfe;">
          <p style="margin: 0; color: #1e40af;">
            <strong>Transportadora:</strong> ${
              order.shipping_carrier || "Não indicada"
            }
          </p>

          <p style="margin: 8px 0 0; color: #1e40af;">
            <strong>Código de tracking:</strong> ${
              order.tracking_code || "Não indicado"
            }
          </p>

          <p style="margin: 8px 0 0; color: #1e40af;">
            <strong>Data de envio:</strong> ${formatarDataEmail(order.shipped_at)}
          </p>

          ${
            order.tracking_url
              ? `
                <p style="margin: 16px 0 0;">
                  <a href="${order.tracking_url}" style="display: inline-block; background: #15803d; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 700;">
                    Acompanhar envio
                  </a>
                </p>
              `
              : ""
          }
        </div>

        ${
          !temTracking
            ? `
              <p style="font-size: 13px; line-height: 1.7; color: #64748b; margin-top: 12px;">
                Caso não exista código de acompanhamento disponível, a encomenda seguirá pela transportadora indicada.
              </p>
            `
            : ""
        }

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
          Morada de entrega
        </h2>

        <p style="font-size: 14px; line-height: 1.7; color: #475569;">
          ${order.address}<br />
          ${order.postal_code} ${order.city}<br />
          ${order.delivery_preference}
        </p>

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

A sua encomenda foi enviada.

Nº da encomenda: ${order.id}
Data da encomenda: ${formatarDataEmail(order.created_at)}
Estado: ${order.status}
Pagamento: ${order.payment_status || "Pendente"}

Transportadora: ${order.shipping_carrier || "Não indicada"}
Código de tracking: ${order.tracking_code || "Não indicado"}
Data de envio: ${formatarDataEmail(order.shipped_at)}

${
  order.tracking_url
    ? `Pode acompanhar o envio através deste link:
${order.tracking_url}`
    : "Caso não exista código de acompanhamento disponível, a encomenda seguirá pela transportadora indicada."
}

Total: ${formatarPrecoEmail(total)}

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
      shipping_carrier,
      tracking_code,
      tracking_url,
      shipped_at,
      shipping_email_sent_at,
      shipping_email_sending_at,
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

async function bloquearEnvioEmailEnvio(orderId: string) {
  const supabaseAdmin = criarSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({
      shipping_email_sending_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .is("shipping_email_sent_at", null)
    .is("shipping_email_sending_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Erro ao bloquear envio do email de encomenda enviada: ${error.message}`
    );
  }

  return Boolean(data?.id);
}

async function marcarEmailEnvioComoEnviado(orderId: string) {
  const supabaseAdmin = criarSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      shipping_email_sent_at: new Date().toISOString(),
      shipping_email_sending_at: null,
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(
      `Email enviado, mas não foi possível marcar como enviado: ${error.message}`
    );
  }
}

async function libertarBloqueioEmailEnvio(orderId: string) {
  const supabaseAdmin = criarSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      shipping_email_sending_at: null,
    })
    .eq("id", orderId);

  if (error) {
    console.error("Erro ao libertar bloqueio do email de envio:", error);
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

    if (orderData.shipping_email_sent_at) {
      return NextResponse.json({
        success: true,
        alreadySent: true,
        message: "O email de encomenda enviada já tinha sido enviado anteriormente.",
      });
    }

    if (orderData.shipping_email_sending_at) {
      return NextResponse.json({
        success: false,
        alreadySending: true,
        error:
          "O email de encomenda enviada já está a ser enviado. Aguarda alguns segundos antes de tentar novamente.",
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

    if (orderData.status !== "Enviado" && orderData.status !== "Entregue") {
      return NextResponse.json(
        {
          success: false,
          error:
            "O email de envio só pode ser enviado quando a encomenda está como Enviado ou Entregue.",
        },
        { status: 400 }
      );
    }

    if (orderData.payment_status !== "Pago") {
      return NextResponse.json(
        {
          success: false,
          error:
            "O email de envio só deve ser enviado depois do pagamento estar confirmado.",
        },
        { status: 400 }
      );
    }

    const bloqueioCriado = await bloquearEnvioEmailEnvio(orderData.id);

    if (!bloqueioCriado) {
      return NextResponse.json({
        success: false,
        alreadySending: true,
        error:
          "O email de encomenda enviada já foi enviado ou já está em envio. Não foi enviado novamente.",
      });
    }

    orderIdParaDesbloquear = orderData.id;

    const clienteEmail = await enviarEmail({
      to: orderData.customer_email,
      subject: "A sua encomenda foi enviada — New & Recycled",
      html: emailClienteHtml(orderData),
      text: emailClienteTexto(orderData),
    });

    await marcarEmailEnvioComoEnviado(orderData.id);

    orderIdParaDesbloquear = null;

    return NextResponse.json({
      success: true,
      message: "Email de encomenda enviada enviado por Gmail.",
      clienteEmail,
    });
  } catch (error) {
    if (orderIdParaDesbloquear) {
      await libertarBloqueioEmailEnvio(orderIdParaDesbloquear);
    }

    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao enviar email de encomenda enviada.";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}