import { createFileRoute } from "@tanstack/react-router";
import ProjectDetail from "@/pages/ProjectDetail";
import { supabase } from "@/integrations/supabase/client";
import { shareHead } from "@/lib/share-head";

export const Route = createFileRoute("/projects/$id")({
  loader: async ({ params }) => {
    const { data } = await supabase.from("projects").select("title, description, image_url").eq("id", params.id).maybeSingle();
    return { share: data };
  },
  head: ({ params, loaderData }) => shareHead(`/projects/${params.id}`, loaderData?.share ? {
    title: `${loaderData.share.title} — Leul Ayfokru`, description: loaderData.share.description, image: loaderData.share.image_url,
  } : undefined),
  component: ProjectDetail,
});
