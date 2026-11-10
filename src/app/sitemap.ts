import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/formations",
    "/a-propos",
    "/actualites",
    "/contact",
    "/connexion",
    "/inscription",
  ];

  return paths.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/formations" || path === "/contact" ? 0.9 : 0.7,
  }));
}
