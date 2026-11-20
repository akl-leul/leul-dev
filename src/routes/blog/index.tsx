import { createFileRoute } from "@tanstack/react-router";
import Blog from "@/pages/Blog";
import { shareHead } from "@/lib/share-head";

export const Route = createFileRoute("/blog/")({
  head: () => shareHead("/blog/"),
  component: Blog,
});
