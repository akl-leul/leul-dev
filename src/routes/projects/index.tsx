import { createFileRoute } from "@tanstack/react-router";
import Projects from "@/pages/Projects";
import { shareHead } from "@/lib/share-head";

export const Route = createFileRoute("/projects/")({
  head: () => shareHead("/projects/"),
  component: Projects,
});
