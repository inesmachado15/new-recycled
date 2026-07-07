import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json({ error: "orderId e amount obrigatórios" }, { status: 400 });
    }

    const mbKey = process.env.IFTHENPAY_MB_KEY;
    if (!mbKey) {
      return NextResponse.json({ error: "IFTHENPAY_MB_KEY não configurado" }, { status: 500 });
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/ifthenpay/callback`;

    const body = {
      mbKey,
      orderId,
      amount: Number(amount).toFixed(2),
      description: `Encomenda New & Recycled ${orderId.slice(0, 8).toUpperCase()}`,
      url: callbackUrl,
      clientCode: "",
      clientName: "",
      clientEmail: "",
      clientUsername: "",
      clientPhone: "",
      expiryDays: 3,
    };

    const res = await fetch("https://ifthenpay.com/api/multibanco/reference/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.Status !== "0") {
      console.error("Ifthenpay MB erro:", data);
      return NextResponse.json({ error: data.Message || "Erro Ifthenpay" }, { status: 502 });
    }

    // Guardar referência na encomenda
    await supabaseAdmin
      .from("orders")
      .update({
        payment_provider: "multibanco",
        payment_entity: data.Entity,
        payment_reference: data.Reference,
        payment_expiry: data.ExpiryDate,
        payment_status: "Pendente",
      })
      .eq("id", orderId);

    return NextResponse.json({
      entity: data.Entity,
      reference: data.Reference,
      amount: data.Amount,
      expiry: data.ExpiryDate,
    });
  } catch (err) {
    console.error("Ifthenpay MB route erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
