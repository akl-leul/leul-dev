import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/Home";
import { shareHead } from "@/lib/share-head";

export const Route = createFileRoute("/")({
  head: () => shareHead("/"),
  component: Home,
});
