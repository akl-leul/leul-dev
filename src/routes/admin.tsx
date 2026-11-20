import { createFileRoute } from "@tanstack/react-router";
import Admin from "@/pages/AdminPage";
import { shareHead } from "@/lib/share-head";

export const Route = createFileRoute("/admin")({
  head: () => shareHead("/admin"),
  component: Admin,
});
