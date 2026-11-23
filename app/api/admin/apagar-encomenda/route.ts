import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest) {
  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "orderId em falta" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
