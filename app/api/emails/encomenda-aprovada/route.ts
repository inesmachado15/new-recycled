import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  enviarEmail,
  formatarDataEmail,
  formatarPrecoEmail,
  getAdminOrderEmail,
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
  payment_provider: string | null;
  payment_entity: string | null;
  payment_reference: string | null;
  payment_expiry: string | null;
  status: string;
  subtotal_products: number | null;
  shipping_cost: number | null;
  total_amount: number | null;
  total_estimated: number | null;
  notes: string | null;
  approval_email_sent_at: string | null;
  approval_email_sending_at: string | null;
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
          Encomenda aprovada
        </h1>

        <p style="font-size: 15px; line-height: 1.7; color: #475569;">
          Olá ${order.customer_name},
        </p>

        <p style="font-size: 15px; line-height: 1.7; color: #475569;">
          A sua encomenda foi validada e aprovada. Já pode avançar com o pagamento, de acordo com o método escolhido.
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
            <strong>Método de pagamento escolhido:</strong> ${
              order.payment_preference
            }
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
            Total final:
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

        ${order.payment_provider === "multibanco" && order.payment_entity && order.payment_reference ? `
        <div style="background: #f4fbf4; border-radius: 16px; padding: 20px; margin-top: 24px; border: 1px solid #bbf7d0;">
          <p style="margin: 0 0 14px; color: #166534; font-weight: 700; font-size: 15px;">
            Referência Multibanco
          </p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 12px; background: #fff; border-radius: 10px; text-align: center; width: 33%;">
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Entidade</div>
                <div style="font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 4px;">${order.payment_entity}</div>
              </td>
              <td style="width: 4%;"></td>
              <td style="padding: 8px 12px; background: #fff; border-radius: 10px; text-align: center; width: 40%;">
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Referência</div>
                <div style="font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 4px;">${order.payment_reference}</div>
              </td>
              <td style="width: 4%;"></td>
              <td style="padding: 8px 12px; background: #fff; border-radius: 10px; text-align: center; width: 23%;">
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Valor</div>
                <div style="font-size: 22px; font-weight: 900; color: #15803d; margin-top: 4px;">${formatarPrecoEmail(order.total_amount || order.total_estimated)}</div>
              </td>
            </tr>
          </table>
          ${order.payment_expiry ? `<p style="margin: 12px 0 0; color: #166534; font-size: 13px;">Válido até: ${order.payment_expiry}</p>` : ""}
          <p style="margin: 12px 0 0; color: #166534; font-size: 13px;">Efectue o pagamento em qualquer ATM ou homebanking com estes dados.</p>
        </div>
        ` : order.payment_provider === "mbway" ? `
        <div style="background: #eff6ff; border-radius: 16px; padding: 20px; margin-top: 24px; border: 1px solid #bfdbfe;">
          <p style="margin: 0; color: #1e40af; font-weight: 700; font-size: 15px;">Pedido MB WAY enviado</p>
          <p style="margin: 10px 0 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
            Deve receber uma notificação MB WAY no seu telemóvel. Aceite o pagamento de <strong>${formatarPrecoEmail(order.total_amount || order.total_estimated)}</strong> para confirmar a encomenda automaticamente.
          </p>
        </div>
        ` : `
        <div style="background: #f4fbf4; border-radius: 16px; padding: 16px; margin-top: 24px; border: 1px solid #bbf7d0;">
          <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.7;">
            Pode agora proceder ao pagamento. Após confirmação do pagamento, receberá a confirmação e a respetiva Fatura-Recibo.
          </p>
        </div>
        `}

        <p style="margin-top: 28px; font-size: 13px; line-height: 1.6; color: #64748b;">
          Obrigado pela preferência.<br />
          New & Recycled
        </p>
      </div>
    </div>
  `;
}

function emailAdminHtml(order: OrderData) {
  const total = order.total_amount || order.total_estimated || 0;

  return `
    <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 24px;">
      <div style="max-width: 760px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 28px; border: 1px solid #e5e7eb;">
        <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.18em; color: #15803d; text-transform: uppercase;">
          Encomenda aprovada
        </p>

        <h1 style="margin: 12px 0 0; font-size: 28px; color: #0f172a;">
          ${order.customer_name}
        </h1>

        <div style="background: #f4fbf4; border-radius: 16px; padding: 16px; margin-top: 20px;">
          <p style="margin: 0;">
            <strong>Nº:</strong> ${order.id}
          </p>

          <p style="margin: 8px 0 0;">
            <strong>Data:</strong> ${formatarDataEmail(order.created_at)}
          </p>

          <p style="margin: 8px 0 0;">
            <strong>Total final:</strong> ${formatarPrecoEmail(total)}
          </p>

          <p style="margin: 8px 0 0;">
            <strong>Pagamento:</strong> ${order.payment_preference}
          </p>

          <p style="margin: 8px 0 0;">
            <strong>Email do cliente:</strong> ${order.customer_email}
          </p>
        </div>

        <p style="font-size: 14px; line-height: 1.7; color: #475569;">
          A encomenda foi aprovada e o cliente foi notificado para avançar com o pagamento.
        </p>
      </div>
    </div>
  `;
}

function emailClienteTexto(order: OrderData) {
  const total = order.total_amount || order.total_estimated || 0;

  const portes =
    order.shipping_cost === null || order.shipping_cost === undefined
      ? "Sob consulta"
      : order.shipping_cost === 0
      ? "Grátis"
      : formatarPrecoEmail(order.shipping_cost);

  return `Olá ${order.customer_name},

A sua encomenda foi aprovada.

Nº da encomenda: ${order.id}
Data: ${formatarDataEmail(order.created_at)}
Estado: ${order.status}
Método de pagamento escolhido: ${order.payment_preference}

Produtos: ${formatarPrecoEmail(order.subtotal_products)}
Portes: ${portes}
Total final: ${formatarPrecoEmail(total)}

${order.payment_provider === "multibanco" && order.payment_entity && order.payment_reference
    ? `REFERÊNCIA MULTIBANCO\nEntidade: ${order.payment_entity}\nReferência: ${order.payment_reference}\nValor: ${formatarPrecoEmail(order.total_amount || order.total_estimated)}${order.payment_expiry ? `\nVálido até: ${order.payment_expiry}` : ""}\n\nEffectue o pagamento em qualquer ATM ou homebanking.`
    : order.payment_provider === "mbway"
    ? `Foi enviado um pedido de pagamento MB WAY para o seu telemóvel. Aceite o pagamento de ${formatarPrecoEmail(order.total_amount || order.total_estimated)} para confirmar a encomenda.`
    : "Pode agora proceder ao pagamento. Após confirmação, receberá a confirmação e a respetiva Fatura-Recibo."
  }

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
      payment_provider,
      payment_entity,
      payment_reference,
      payment_expiry,
      status,
      subtotal_products,
      shipping_cost,
      total_amount,
      total_estimated,
      notes,
      approval_email_sent_at,
      approval_email_sending_at,
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

async function bloquearEnvioEmailAprovacao(orderId: string) {
  const supabaseAdmin = criarSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({
      approval_email_sending_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .is("approval_email_sent_at", null)
    .is("approval_email_sending_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao bloquear envio do email: ${error.message}`);
  }

  return Boolean(data?.id);
}

async function marcarEmailAprovacaoComoEnviado(orderId: string) {
  const supabaseAdmin = criarSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      approval_email_sent_at: new Date().toISOString(),
      approval_email_sending_at: null,
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(
      `Email enviado, mas não foi possível marcar como enviado: ${error.message}`
    );
  }
}

async function libertarBloqueioEmailAprovacao(orderId: string) {
  const supabaseAdmin = criarSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      approval_email_sending_at: null,
    })
    .eq("id", orderId);

  if (error) {
    console.error("Erro ao libertar bloqueio do email de aprovação:", error);
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

    if (orderData.approval_email_sent_at) {
      return NextResponse.json({
        success: true,
        alreadySent: true,
        message: "O email de aprovação já tinha sido enviado anteriormente.",
      });
    }

    if (orderData.approval_email_sending_at) {
      return NextResponse.json({
        success: false,
        alreadySending: true,
        error:
          "O email de aprovação já está a ser enviado. Aguarda alguns segundos antes de tentar novamente.",
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

    const bloqueioCriado = await bloquearEnvioEmailAprovacao(orderData.id);

    if (!bloqueioCriado) {
      return NextResponse.json({
        success: false,
        alreadySending: true,
        error:
          "O email de aprovação já foi enviado ou já está em envio. Não foi enviado novamente.",
      });
    }

    orderIdParaDesbloquear = orderData.id;

    const clienteEmail = await enviarEmail({
      to: orderData.customer_email,
      subject: "A sua encomenda foi aprovada — New & Recycled",
      html: emailClienteHtml(orderData),
      text: emailClienteTexto(orderData),
    });

    const adminEmail = await enviarEmail({
      to: getAdminOrderEmail(),
      subject: `Encomenda aprovada — ${orderData.customer_name}`,
      html: emailAdminHtml(orderData),
      text: `A encomenda ${orderData.id} foi aprovada e o cliente foi notificado para avançar com o pagamento.`,
    });

    await marcarEmailAprovacaoComoEnviado(orderData.id);

    orderIdParaDesbloquear = null;

    return NextResponse.json({
      success: true,
      message: "Email de aprovação enviado por Gmail.",
      clienteEmail,
      adminEmail,
    });
  } catch (error) {
    if (orderIdParaDesbloquear) {
      await libertarBloqueioEmailAprovacao(orderIdParaDesbloquear);
    }

    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao enviar email de aprovação.";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}