import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BurgerMapper",
    short_name: "BurgerMapper",
    description: "Turn official Berlin letters into clear, source-aware next steps.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3ec",
    theme_color: "#17211d",
  };
}
