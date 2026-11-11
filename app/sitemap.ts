import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.new-recycled.pt";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/produtos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/como-encomendar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contacto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/sobre`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/termos`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacidade`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Buscar todos os produtos em páginas de 1000
    let todos: { slug: string; updated_at: string }[] = [];
    let from = 0;
    while (true) {
      const { data: lote } = await supabase
        .from("products")
        .select("slug, updated_at")
        .eq("active", true)
        .range(from, from + 999);
      if (!lote || lote.length === 0) break;
      todos = todos.concat(lote);
      if (lote.length < 1000) break;
      from += 1000;
    }
    const data = todos;

    const productRoutes: MetadataRoute.Sitemap = (data || []).map((p) => ({
      url: `${baseUrl}/produtos/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
