import { createFileRoute } from "@tanstack/react-router";
import DynamicPage from "@/pages/DynamicPage";
import { shareHead } from "@/lib/share-head";

export const Route = createFileRoute("/page/$slug")({
  head: () => shareHead("/page/$slug"),
  component: DynamicPage,
});
