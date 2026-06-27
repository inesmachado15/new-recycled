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
  status: string;
  subtotal_products: number | null;
  shipping_cost: number | null;
  total_amount: number | null;
  total_estimated: number | null;
  notes: string | null;
  order_items: OrderItem[];
};

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

function emailAdminHtml(order: OrderData) {
  const total = order.total_amount || order.total_estimated || 0;

  return `
    <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 24px;">
      <div style="max-width: 760px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 28px; border: 1px solid #e5e7eb;">
        <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.18em; color: #15803d; text-transform: uppercase;">
          New & Recycled
        </p>

        <h1 style="margin: 12px 0 0; font-size: 28px; color: #0f172a;">
          Nova encomenda para aprovação
        </h1>

        <p style="font-size: 15px; line-height: 1.7; color: #475569;">
          Foi recebida uma nova encomenda no site. Deve ser analisada e aprovada no painel de administração.
        </p>

        <div style="background: #f4fbf4; border-radius: 16px; padding: 16px; margin-top: 20px;">
          <p style="margin: 0;"><strong>Nº:</strong> ${order.id}</p>
          <p style="margin: 8px 0 0;"><strong>Data:</strong> ${formatarDataEmail(
            order.created_at
          )}</p>
          <p style="margin: 8px 0 0;"><strong>Cliente:</strong> ${
            order.customer_name
          }</p>
          <p style="margin: 8px 0 0;"><strong>Total estimado:</strong> ${formatarPrecoEmail(
            total
          )}</p>
          <p style="margin: 8px 0 0;"><strong>Estado:</strong> ${
            order.status
          }</p>
          <p style="margin: 8px 0 0;"><strong>Pagamento escolhido:</strong> ${
            order.payment_preference
          }</p>
        </div>

        <h2 style="font-size: 18px; margin-top: 28px; color: #0f172a;">
          Dados do cliente
        </h2>

        <p style="font-size: 14px; line-height: 1.7; color: #475569;">
          <strong>Nome:</strong> ${order.customer_name}<br />
          <strong>Email:</strong> ${order.customer_email}<br />
          <strong>Telefone:</strong> ${order.customer_phone}<br />
          <strong>Tipo:</strong> ${order.customer_type}<br />
          <strong>Empresa:</strong> ${order.company_name || "Não indicado"}<br />
          <strong>NIF:</strong> ${order.nif || "Não indicado"}
        </p>

        <h2 style="font-size: 18px; margin-top: 28px; color: #0f172a;">
          Produtos
        </h2>

        <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
          ${criarListaProdutosHtml(order.order_items)}
        </table>

        <div style="margin-top: 22px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <p style="margin: 0; color: #475569;">
            Produtos: <strong style="float: right; color: #0f172a;">${formatarPrecoEmail(
              order.subtotal_products
            )}</strong>
          </p>
          <p style="margin: 10px 0 0; color: #475569;">
            Portes: <strong style="float: right; color: #0f172a;">${formatarPrecoEmail(
              order.shipping_cost
            )}</strong>
          </p>
          <p style="margin: 16px 0 0; font-size: 18px; color: #0f172a;">
            Total estimado: <strong style="float: right;">${formatarPrecoEmail(
              total
            )}</strong>
          </p>
        </div>

        <h2 style="font-size: 18px; margin-top: 28px; color: #0f172a;">
          Morada
        </h2>

        <p style="font-size: 14px; line-height: 1.7; color: #475569;">
          ${order.address}<br />
          ${order.postal_code} ${order.city}<br />
          ${order.delivery_preference}
        </p>

        <h2 style="font-size: 18px; margin-top: 28px; color: #0f172a;">
          Observações
        </h2>

        <p style="font-size: 14px; line-height: 1.7; color: #475569;">
          ${order.notes || "Sem observações"}
        </p>

        <p style="margin-top: 28px; font-size: 13px; line-height: 1.6; color: #64748b;">
          Aceda ao painel de administração para validar stock, portes e aprovar a encomenda.
        </p>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId é obrigatório." },
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
        notes,
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
      return NextResponse.json(
        {
          error: `Encomenda não encontrada: ${
            orderError?.message || "sem dados"
          }`,
        },
        { status: 404 }
      );
    }

    const orderData = order as OrderData;
    const adminEmail = getAdminOrderEmail();

    const adminEmailResult = await enviarEmail({
      to: adminEmail,
      subject: `Nova encomenda para aprovação — ${orderData.customer_name}`,
      html: emailAdminHtml(orderData),
    });

    return NextResponse.json({
      success: true,
      adminEmail: adminEmailResult,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao enviar email.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}