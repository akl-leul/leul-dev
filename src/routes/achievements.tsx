import { createFileRoute } from "@tanstack/react-router";
import Achievements from "@/pages/Achievements";
import { shareHead } from "@/lib/share-head";

export const Route = createFileRoute("/achievements")({
  head: () => shareHead("/achievements"),
  component: Achievements,
});
