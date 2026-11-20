import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount, phone, email } = await req.json();

    if (!orderId || !amount || !phone) {
      return NextResponse.json({ error: "orderId, amount e phone obrigatórios" }, { status: 400 });
    }

    const mbWayKey = process.env.IFTHENPAY_MBWAY_KEY;
    if (!mbWayKey) {
      return NextResponse.json({ error: "IFTHENPAY_MBWAY_KEY não configurado" }, { status: 500 });
    }

    // Formatar telefone: remover espaços/traços, adicionar prefixo 351# se necessário
    const phoneClean = phone.replace(/\s|-/g, "").replace(/^\+351/, "").replace(/^351/, "");
    const phoneFmt = `351#${phoneClean}`;

    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/ifthenpay/callback`;

    const shortOrderId = orderId.replace(/-/g, "").slice(0, 15);

    const body = {
      mbWayKey,
      orderId: shortOrderId,
      amount: Number(amount).toFixed(2),
      mobileNumber: phoneFmt,
      email: email || "",
      description: `Encomenda New & Recycled ${shortOrderId}`,
      notificationUrl: callbackUrl,
    };

    const res = await fetch("https://api.ifthenpay.com/spg/payment/mbway", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const rawText = await res.text();
    console.log("Ifthenpay MBWAY resposta raw:", rawText);

    let data: Record<string, string>;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("Ifthenpay MBWAY resposta não é JSON:", rawText);
      return NextResponse.json({ error: `MB WAY: resposta inválida — ${rawText.slice(0, 100)}` }, { status: 502 });
    }

    // MB WAY: Status "000" = sucesso
    if (data.Status !== "000") {
      console.error("Ifthenpay MBWAY erro:", JSON.stringify(data));
      return NextResponse.json({ error: `MB WAY: ${data.Message || "Erro"} (código ${data.Status})` }, { status: 502 });
    }

    await supabaseAdmin
      .from("orders")
      .update({
        payment_provider: "mbway",
        payment_reference: data.RequestId || phoneFmt,
        payment_status: "Pendente",
      })
      .eq("id", orderId);

    return NextResponse.json({ requestId: data.RequestId });
  } catch (err) {
    console.error("Ifthenpay MBWAY route erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
