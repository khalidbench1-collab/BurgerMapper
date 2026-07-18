import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BurgerMapper",
    short_name: "BurgerMapper",
    description: "Clear next steps from official Berlin letters.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3ec",
    theme_color: "#17211d",
  };
}
