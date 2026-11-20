import { createFileRoute } from "@tanstack/react-router";
import About from "@/pages/About";
import { shareHead } from "@/lib/share-head";

export const Route = createFileRoute("/about")({
  head: () => shareHead("/about"),
  component: About,
});
