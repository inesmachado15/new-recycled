import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  autenticarKeyInvoice,
  chamarMetodoKeyInvoice,
} from "@/lib/keyinvoice";

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
  keyinvoice_doc_type: string | null;
  keyinvoice_doc_series: string | null;
  keyinvoice_doc_num: string | null;
  keyinvoice_full_doc_number: string | null;
  keyinvoice_invoice_issued_at: string | null;
  keyinvoice_invoice_sent_at: string | null;
  keyinvoice_invoice_issuing_at: string | null;
  order_items: OrderItem[];
};

function hojeFormatoKeyInvoice() {
  return new Date().toISOString().slice(0, 10);
}

function limparPrecoTexto(priceText: string | null) {
  if (!priceText) return 0;

  const limpo = priceText.replace("€", "").replace(",", ".").trim();
  const valor = Number(limpo);

  return Number.isFinite(valor) ? valor : 0;
}

function limparNif(nif: string | null | undefined) {
  return String(nif || "").replace(/\D/g, "");
}

function validarNif(nif: string | null) {
  const nifLimpo = limparNif(nif);
  return nifLimpo.length === 9;
}

function obterPrecoUnitario(item: OrderItem) {
  if (item.unit_price !== null && item.unit_price !== undefined) {
    return Number(item.unit_price);
  }

  return limparPrecoTexto(item.price_text);
}

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

function prepararPayloadClienteKeyInvoice(order: OrderData) {
  const nifLimpo = limparNif(order.nif);
  const nomeCliente =
    order.customer_type === "Empresa"
      ? order.company_name || order.customer_name
      : order.customer_name;

  return {
    method: "insertClient",
    IdClient: nifLimpo,
    VATIN: nifLimpo,
    Name: nomeCliente,
    Address: order.address,
    PostalCode: order.postal_code,
    Locality: order.city,
    CountryCode: "PT",
    Phone: order.customer_phone,
    Email: order.customer_email,
    Comments: `Cliente criado automaticamente a partir da encomenda ${order.id} no site New & Recycled.`,
  };
}

async function criarOuObterClienteKeyInvoice(sid: string, order: OrderData) {
  if (order.customer_type !== "Empresa") {
    return null;
  }

  const nifLimpo = limparNif(order.nif);

  if (!validarNif(order.nif)) {
    throw new Error(
      "O NIF da empresa deve ter 9 dígitos antes de criar o cliente no KeyInvoice."
    );
  }

  const payloadCliente = prepararPayloadClienteKeyInvoice(order);

  try {
    const resultadoCliente = await chamarMetodoKeyInvoice(sid, payloadCliente);

    const dadosCliente = resultadoCliente.Data as
      | {
          Id?: string | number;
        }
      | undefined;

    const idClienteCriado = dadosCliente?.Id
      ? String(dadosCliente.Id)
      : nifLimpo;

    return idClienteCriado;
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao criar cliente no KeyInvoice.";

    console.warn(
      `Não foi possível criar o cliente no KeyInvoice com insertClient. Vou tentar usar IdClient=${nifLimpo}. Erro: ${mensagem}`
    );

    return nifLimpo;
  }
}

function prepararPayloadFaturaRecibo(order: OrderData, idCliente?: string | null) {
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

  const dadosCliente =
    idCliente && order.customer_type === "Empresa"
      ? {
          IdClient: idCliente,
        }
      : {
          Name: order.customer_name,
          Address: order.address,
          PostalCode: order.postal_code,
          Locality: order.city,
          CountryCode: "PT",
        };

  return {
    method: "insertDocument",
    DocType: docType,
    DocSeries: docSeries,
    ...dadosCliente,
    DocDate: dataHoje,
    DueDate: dataHoje,
    DocReference: order.id,
    Comments: `Fatura-recibo emitida automaticamente a partir da encomenda ${order.id} no site New & Recycled.`,
    IdPaymentMethod: idPaymentMethod,
    DocLines: [...linhasProdutos, ...linhasPortes],
  };
}

async function obterEncomenda(supabaseAdmin: any, orderId: string) {
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
      keyinvoice_doc_type,
      keyinvoice_doc_series,
      keyinvoice_doc_num,
      keyinvoice_full_doc_number,
      keyinvoice_invoice_issued_at,
      keyinvoice_invoice_sent_at,
      keyinvoice_invoice_issuing_at,
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
    throw new Error(
      `Encomenda não encontrada: ${orderError?.message || "sem dados"}`
    );
  }

  return order as OrderData;
}

function validarEncomendaParaFatura(order: OrderData) {
  if (order.keyinvoice_doc_num) {
    throw new Error(
      `Esta encomenda já tem fatura-recibo emitida: ${
        order.keyinvoice_full_doc_number ||
        `${order.keyinvoice_doc_type} ${order.keyinvoice_doc_series}/${order.keyinvoice_doc_num}`
      }.`
    );
  }

  if (order.keyinvoice_invoice_issuing_at) {
    throw new Error(
      "Esta encomenda já tem uma Fatura-Recibo em emissão. Aguarda alguns segundos antes de tentar novamente."
    );
  }

  if (order.payment_status !== "Pago") {
    throw new Error(
      `A encomenda ainda não está paga. Estado atual do pagamento: ${
        order.payment_status || "Pendente"
      }.`
    );
  }

  if (order.status !== "Pago" && order.status !== "Em preparação") {
    throw new Error(
      `A encomenda deve estar em estado Pago ou Em preparação antes de emitir fatura. Estado atual: ${order.status}.`
    );
  }

  if (!order.customer_name || !order.address || !order.postal_code || !order.city) {
    throw new Error(
      "A encomenda não tem todos os dados obrigatórios do cliente: nome, morada, código postal e localidade."
    );
  }

  if (order.customer_type === "Empresa") {
    if (!order.company_name || order.company_name.trim() === "") {
      throw new Error(
        "Esta encomenda é de empresa, mas não tem nome da empresa. Corrige os dados antes de emitir a Fatura-Recibo."
      );
    }

    if (!order.nif || order.nif.trim() === "") {
      throw new Error(
        "Esta encomenda é de empresa, mas não tem NIF. Corrige os dados antes de emitir a Fatura-Recibo."
      );
    }

    if (!validarNif(order.nif)) {
      throw new Error(
        "O NIF da empresa deve ter 9 dígitos. Corrige o NIF antes de emitir a Fatura-Recibo."
      );
    }
  }

  if (order.shipping_cost === null || order.shipping_cost === undefined) {
    throw new Error(
      "Esta encomenda tem portes sob consulta. Define primeiro o valor final dos portes antes de emitir a Fatura-Recibo."
    );
  }

  if (!order.order_items || order.order_items.length === 0) {
    throw new Error("A encomenda não tem produtos associados.");
  }
}

async function bloquearEmissaoFatura(supabaseAdmin: any, orderId: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({
      keyinvoice_invoice_issuing_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .is("keyinvoice_doc_num", null)
    .is("keyinvoice_invoice_issuing_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao bloquear emissão da Fatura-Recibo: ${error.message}`);
  }

  return Boolean(data?.id);
}

async function libertarBloqueioEmissaoFatura(
  supabaseAdmin: any,
  orderId: string
) {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      keyinvoice_invoice_issuing_at: null,
    })
    .eq("id", orderId);

  if (error) {
    console.error("Erro ao libertar bloqueio de emissão da Fatura-Recibo:", error);
  }
}

async function guardarDadosFaturaNoSupabase({
  supabaseAdmin,
  orderId,
  docType,
  docSeries,
  docNum,
  fullDocNumber,
}: {
  supabaseAdmin: any;
  orderId: string;
  docType: string;
  docSeries: string;
  docNum: string;
  fullDocNumber: string;
}) {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      keyinvoice_doc_type: docType,
      keyinvoice_doc_series: docSeries,
      keyinvoice_doc_num: docNum,
      keyinvoice_full_doc_number: fullDocNumber,
      keyinvoice_invoice_issued_at: new Date().toISOString(),
      keyinvoice_invoice_issuing_at: null,
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(
      `A fatura-recibo foi emitida no KeyInvoice, mas não foi possível guardar os dados no Supabase: ${error.message}`
    );
  }
}

export async function POST(request: Request) {
  let supabaseAdminParaDesbloquear: any = null;
  let orderIdParaDesbloquear: string | null = null;

  try {
    const body = await request.json();
    const orderId = body.orderId;
    const confirmar = body.confirmar;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId é obrigatório." },
        { status: 400 }
      );
    }

    if (confirmar !== "SIM") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Confirmação obrigatória em falta. Envia confirmar: 'SIM' para emitir a fatura-recibo.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = criarSupabaseAdmin();
    supabaseAdminParaDesbloquear = supabaseAdmin;

    const order = await obterEncomenda(supabaseAdmin, String(orderId));

    validarEncomendaParaFatura(order);

    const bloqueioCriado = await bloquearEmissaoFatura(
      supabaseAdmin,
      order.id
    );

    if (!bloqueioCriado) {
      const encomendaAtualizada = await obterEncomenda(supabaseAdmin, order.id);

      if (encomendaAtualizada.keyinvoice_doc_num) {
        return NextResponse.json(
          {
            success: false,
            error: `Esta encomenda já tem fatura-recibo emitida: ${
              encomendaAtualizada.keyinvoice_full_doc_number ||
              `${encomendaAtualizada.keyinvoice_doc_type} ${encomendaAtualizada.keyinvoice_doc_series}/${encomendaAtualizada.keyinvoice_doc_num}`
            }.`,
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "Esta encomenda já tem uma Fatura-Recibo em emissão. Aguarda alguns segundos antes de tentar novamente.",
        },
        { status: 409 }
      );
    }

    orderIdParaDesbloquear = order.id;

    const sid = await autenticarKeyInvoice();

    const idClienteKeyInvoice = await criarOuObterClienteKeyInvoice(sid, order);

    const payloadKeyInvoice = prepararPayloadFaturaRecibo(
      order,
      idClienteKeyInvoice
    );

    const resultadoKeyInvoice = await chamarMetodoKeyInvoice(
      sid,
      payloadKeyInvoice
    );

    const dadosDocumento = resultadoKeyInvoice.Data as
      | {
          DocType?: string | number;
          DocSeries?: string | number;
          DocNum?: string | number;
          FullDocNumber?: string;
        }
      | undefined;

    const docType = String(dadosDocumento?.DocType || payloadKeyInvoice.DocType);
    const docSeries = String(
      dadosDocumento?.DocSeries || payloadKeyInvoice.DocSeries
    );
    const docNum = String(dadosDocumento?.DocNum || "");
    const fullDocNumber = String(
      dadosDocumento?.FullDocNumber || `${docType} ${docSeries}/${docNum}`
    );

    if (!docNum) {
      throw new Error(
        "O KeyInvoice emitiu a fatura-recibo, mas não devolveu DocNum."
      );
    }

    await guardarDadosFaturaNoSupabase({
      supabaseAdmin,
      orderId: order.id,
      docType,
      docSeries,
      docNum,
      fullDocNumber,
    });

    orderIdParaDesbloquear = null;

    return NextResponse.json({
      success: true,
      message: "Fatura-recibo emitida no KeyInvoice e guardada no Supabase.",
      order: {
        id: order.id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_type: order.customer_type,
        company_name: order.company_name,
        nif: order.nif,
        payment_status: order.payment_status,
        status: order.status,
        total_amount: order.total_amount,
        total_estimated: order.total_estimated,
      },
      keyinvoiceClient: idClienteKeyInvoice
        ? {
            idClient: idClienteKeyInvoice,
            vatIn: limparNif(order.nif),
          }
        : null,
      keyinvoice: {
        docType,
        docSeries,
        docNum,
        fullDocNumber,
      },
    });
  } catch (error) {
    if (supabaseAdminParaDesbloquear && orderIdParaDesbloquear) {
      await libertarBloqueioEmissaoFatura(
        supabaseAdminParaDesbloquear,
        orderIdParaDesbloquear
      );
    }

    const message =
  error instanceof Error
    ? error.message
    : "Erro desconhecido ao emitir fatura-recibo.";

console.error("Erro ao emitir Fatura-Recibo no KeyInvoice:", {
  message,
  error,
});

return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}