import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE_URL = "https://www.new-recycled.pt";
const SHOP_NAME = "New & Recycled";

function escapeXml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Buscar todos os produtos activos com preço
  let todos: any[] = [];
  let from = 0;
  while (true) {
    const { data } = await supabase
      .from("products")
      .select("slug, name, brand, category, reference, price, image_url, mucho_url")
      .eq("active", true)
      .not("price", "is", null)
      .not("image_url", "is", null)
      .range(from, from + 999);
    if (!data || data.length === 0) break;
    todos = todos.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }

  const items = todos
    .map((p) => {
      const url = `${BASE_URL}/produtos/${p.slug}`;
      const price = Number(p.price).toFixed(2);

      // Mapear categoria para Google Product Category
      const categoryMap: Record<string, string> = {
        "Toners": "Electronics > Print, Copy, Scan &amp; Fax > Printer, Copier &amp; Fax Machine Accessories > Toner &amp; Inkjet Cartridges",
        "Tinteiros": "Electronics > Print, Copy, Scan &amp; Fax > Printer, Copier &amp; Fax Machine Accessories > Toner &amp; Inkjet Cartridges",
        "Consumíveis": "Electronics > Print, Copy, Scan &amp; Fax > Printer, Copier &amp; Fax Machine Accessories",
        "Rolos Térmicos": "Office Supplies > Paper Products > Receipt &amp; Adding Machine Paper",
        "Papelaria": "Office Supplies",
        "Equipamento de Escritório": "Electronics > Print, Copy, Scan &amp; Fax",
      };
      const googleCategory = categoryMap[p.category] || "Office Supplies";

      return `  <item>
    <g:id>${escapeXml(p.slug)}</g:id>
    <g:title>${escapeXml(p.name)}</g:title>
    <g:description>${escapeXml(p.name)}</g:description>
    <g:link>${url}</g:link>
    <g:image_link>${escapeXml(p.image_url)}</g:image_link>
    <g:availability>in_stock</g:availability>
    <g:price>${price} EUR</g:price>
    <g:brand>${escapeXml(p.brand || SHOP_NAME)}</g:brand>
    <g:condition>new</g:condition>
    <g:google_product_category>${googleCategory}</g:google_product_category>${p.reference ? `\n    <g:mpn>${escapeXml(p.reference)}</g:mpn>` : ""}
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${SHOP_NAME}</title>
    <link>${BASE_URL}</link>
    <description>Feed de produtos ${SHOP_NAME}</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
