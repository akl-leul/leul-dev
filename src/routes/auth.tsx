import { createFileRoute } from "@tanstack/react-router";
import Auth from "@/pages/Auth";
import { shareHead } from "@/lib/share-head";

export const Route = createFileRoute("/auth")({
  head: () => shareHead("/auth"),
  component: Auth,
});
