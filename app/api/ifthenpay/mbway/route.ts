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

    const body = {
      mbWayKey,
      orderId,
      amount: Number(amount).toFixed(2),
      mobileNumber: phoneFmt,
      email: email || "",
      description: `Encomenda New & Recycled ${orderId.slice(0, 8).toUpperCase()}`,
      url: callbackUrl,
    };

    const res = await fetch("https://ifthenpay.com/api/spg/payment/mbway", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // MB WAY: Status "000" = sucesso
    if (data.Status !== "000") {
      console.error("Ifthenpay MBWAY erro:", data);
      return NextResponse.json({ error: data.Message || "Erro MB WAY" }, { status: 502 });
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
