import { createFileRoute } from "@tanstack/react-router";
import BlogPost from "@/pages/BlogPost";
import { supabase } from "@/integrations/supabase/client";
import { shareHead } from "@/lib/share-head";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase.from("posts").select("title, excerpt, featured_image").eq("slug", params.slug).eq("published", true).maybeSingle();
    return { share: data };
  },
  head: ({ params, loaderData }) => shareHead(`/blog/${params.slug}`, loaderData?.share ? {
    title: `${loaderData.share.title} — Leul Ayfokru`, description: loaderData.share.excerpt, image: loaderData.share.featured_image, type: "article",
  } : undefined),
  component: BlogPost,
});
