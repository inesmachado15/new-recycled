import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number | null;
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
  order_items: OrderItem[];
};

function hojeFormatoKeyInvoice() {
  return new Date().toISOString().slice(0, 10);
}

function limparPrecoTexto(priceText: string | null) {
  if (!priceText) return 0;

  const limpo = priceText
    .replace("€", "")
    .replace(",", ".")
    .trim();

  const valor = Number(limpo);

  return Number.isFinite(valor) ? valor : 0;
}

function obterPrecoUnitario(item: OrderItem) {
  if (item.unit_price !== null && item.unit_price !== undefined) {
    return Number(item.unit_price);
  }

  return limparPrecoTexto(item.price_text);
}

function prepararPayloadFaturaRecibo(order: OrderData) {
  const docType = process.env.KEYINVOICE_DOCTYPE || "34";
  const docSeries = process.env.KEYINVOICE_DOCSERIES || "41";
  const idTax = process.env.KEYINVOICE_IDTAX || "1";
  const idPaymentMethod =
    process.env.KEYINVOICE_PAYMENT_METHOD_MULTIBANCO || "4";
  const genericProductId =
    process.env.KEYINVOICE_GENERIC_PRODUCT_ID || "ONLINE";

  const dataHoje = hojeFormatoKeyInvoice();

  const linhasProdutos = order.order_items.map((item) => ({
    IdProduct: genericProductId,
    ProductName: item.product_name,
    Qty: String(item.quantity),
    Price: String(obterPrecoUnitario(item)),
    IdTax: idTax,
  }));

  const linhasPortes =
    Number(order.shipping_cost || 0) > 0
      ? [
          {
            IdProduct: genericProductId,
            ProductName: "Portes de envio",
            Qty: "1",
            Price: String(Number(order.shipping_cost || 0)),
            IdTax: idTax,
          },
        ]
      : [];

  return {
    method: "insertDocument",
    DocType: docType,
    DocSeries: docSeries,
    Name: order.customer_name,
    Address: order.address,
    PostalCode: order.postal_code,
    Locality: order.city,
    CountryCode: "PT",
    DocDate: dataHoje,
    DueDate: dataHoje,
    DocReference: order.id,
    Comments: `Fatura-recibo emitida automaticamente a partir da encomenda ${order.id} no site New & Recycled.`,
    IdPaymentMethod: idPaymentMethod,
    DocLines: [...linhasProdutos, ...linhasPortes],
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId é obrigatório." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
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
        order_items (
          product_name,
          quantity,
          unit_price,
          price_text
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: `Encomenda não encontrada: ${
            orderError?.message || "sem dados"
          }`,
        },
        { status: 404 }
      );
    }

    const orderData = order as OrderData;
    const payloadKeyInvoice = prepararPayloadFaturaRecibo(orderData);

    return NextResponse.json({
      success: true,
      order: {
        id: orderData.id,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        payment_status: orderData.payment_status,
        status: orderData.status,
        total_amount: orderData.total_amount,
        total_estimated: orderData.total_estimated,
      },
      payloadKeyInvoice,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao preparar fatura.";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}