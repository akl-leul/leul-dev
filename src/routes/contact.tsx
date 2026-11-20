import { createFileRoute } from "@tanstack/react-router";
import Contact from "@/pages/Contact";
import { shareHead } from "@/lib/share-head";

export const Route = createFileRoute("/contact")({
  head: () => shareHead("/contact"),
  component: Contact,
});
