import type { MetadataRoute } from "next";
import { siteConfig } from "@/shared/utils/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/services",
          "/trash",
          "/starred",
          "/login",
          "/register",
          "/verify-email",
          "/verification-success",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
