import { createFileRoute } from "@tanstack/react-router";
import Skills from "@/pages/Skills";
import { shareHead } from "@/lib/share-head";

export const Route = createFileRoute("/skills")({
  head: () => shareHead("/skills"),
  component: Skills,
});
