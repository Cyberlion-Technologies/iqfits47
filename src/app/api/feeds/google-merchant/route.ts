import { NextResponse } from "next/server";
import { getDbProducts } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getDbProducts();
    const siteUrl = "https://iqfits47.store";

    const escapeXml = (str: string) => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    let xml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>IQFITS-47</title>
    <link>${siteUrl}</link>
    <description>Kicks, streetwear and designer apparel e-store for the Kenyan market.</description>
`;

    for (const p of products) {
      const productUrl = `${siteUrl}/product/${p.slug}`;
      const inStock = p.sizes.some((s) => s.stock > 0);
      const availability = inStock ? "in_stock" : "out_of_stock";
      const desc = p.description || `Buy original ${p.brand} ${p.name} in Kenya.`;
      
      const googleCategory = p.category === "sneakers" 
        ? "Apparel &amp; Accessories &gt; Shoes" 
        : p.category === "apparel" 
        ? "Apparel &amp; Accessories &gt; Clothing" 
        : "Apparel &amp; Accessories";

      xml += `    <item>
      <g:id>${p.id}</g:id>
      <g:title>${escapeXml(`${p.brand} ${p.name} - ${p.colorway}`)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${escapeXml(p.images[0])}</g:image_link>
`;

      if (p.images.length > 1) {
        for (let i = 1; i < Math.min(p.images.length, 10); i++) {
          xml += `      <g:additional_image_link>${escapeXml(p.images[i])}</g:additional_image_link>\n`;
        }
      }

      xml += `      <g:availability>${availability}</g:availability>
      <g:price>${p.price.toFixed(2)} KES</g:price>
      <g:brand>${escapeXml(p.brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:mpn>${escapeXml(p.slug.toUpperCase())}</g:mpn>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:color>${escapeXml(p.colorway)}</g:color>
`;

      // Size system if sneakers
      if (p.category === "sneakers") {
        const availableSizes = p.sizes.filter(s => s.stock > 0).map(s => s.size).join("/");
        if (availableSizes) {
          xml += `      <g:size>${escapeXml(availableSizes)}</g:size>\n`;
          xml += `      <g:size_system>EU</g:size_system>\n`;
        }
      }

      xml += `    </item>\n`;
    }

    xml += `  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating google merchant feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
