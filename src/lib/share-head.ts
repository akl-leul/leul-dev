import { getShareMetadata, HOME_IMAGE, type ShareContent } from "@/lib/share-metadata";

export function shareHead(pathname: string, content?: ShareContent) {
  const m = getShareMetadata(pathname, content);
  const meta = [
    { title: m.title },
    { name: "description", content: m.description },
    { property: "og:title", content: m.title },
    { property: "og:description", content: m.description },
    { property: "og:url", content: m.url },
    { property: "og:type", content: m.type },
    { property: "og:image", content: m.image },
    { property: "og:image:alt", content: m.title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: m.title },
    { name: "twitter:description", content: m.description },
    { name: "twitter:image", content: m.image },
    ...(m.image === HOME_IMAGE ? [{ property: "og:image:width", content: "1200" }, { property: "og:image:height", content: "630" }] : []),
  ];
  return { meta, links: [{ rel: "canonical", href: m.url }] };
}
