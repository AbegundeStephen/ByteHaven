import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/whatsapp";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/checkout", "/cart", "/order-confirmation"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
