import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.NEXT_PUBLIC_SITE_ENV === "production";

  if (!isProd) {
    // Blocka ALLT i test
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  // Prod: tillåt
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://formogenhetskollen.se/sitemap.xml",
  };
}

