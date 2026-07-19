import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BurgerMapper",
    short_name: "BurgerMapper",
    description:
      "Describe what you need to get done in Berlin — or add an official letter — and get a clear, source-aware route. An independent guide, not a government service.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3ec",
    theme_color: "#17211d",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
