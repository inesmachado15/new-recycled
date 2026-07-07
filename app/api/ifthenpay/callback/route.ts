import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const key = searchParams.get("key");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    // Verificar chave anti-phishing
    const antiPhishingKey = process.env.IFTHENPAY_ANTI_PHISHING_KEY;
    if (antiPhishingKey && key !== antiPhishingKey) {
      console.warn("Callback Ifthenpay: chave anti-phishing inválida");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!orderId) {
      return new NextResponse("orderId em falta", { status: 400 });
    }

    // Confirmar pagamento na encomenda
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "Pago",
        status: "Confirmado",
      })
      .eq("id", orderId);

    if (error) {
      console.error("Callback Ifthenpay: erro ao actualizar encomenda", error);
      return new NextResponse("Erro ao actualizar", { status: 500 });
    }

    console.log(`Pagamento confirmado: encomenda ${orderId} | valor ${amount}`);

    // Ifthenpay espera "OK" em texto plano como resposta de sucesso
    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Callback Ifthenpay erro:", err);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
