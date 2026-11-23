import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { slug } = await req.json();

  revalidatePath("/produtos/[slug]", "page");
  revalidatePath("/produtos", "page");
  revalidatePath("/", "page");

  if (slug) {
    revalidatePath(`/produtos/${slug}`, "page");
  }

  return NextResponse.json({ revalidated: true, slug });
}
