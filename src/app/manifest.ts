import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alopedia — AI 두피 분석",
    short_name: "Alopedia",
    description:
      "사진 한 장으로 AI가 두피 상태를 분석합니다. 변화를 추적하고, 같은 고민을 가진 사람들과 경험을 나눠보세요.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6161FF",
    orientation: "portrait",
    categories: ["health", "medical", "lifestyle"],
    lang: "ko",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
