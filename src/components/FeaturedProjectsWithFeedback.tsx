import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface ProjectWithFeedback {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  demo_url: string | null;
  github_url: string | null;
  tech_stack: string[];
  featured: boolean;
  status: string;
  feedback_count: number;
  average_rating: number;
  latest_feedback: {
    author_name: string;
    content: string;
    rating: number | null;
    created_at: string;
  } | null;
}

export function FeaturedProjectsWithFeedback() {
  const [projects, setProjects] = useState<ProjectWithFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectsWithFeedback = async () => {
      try {
        // Get projects with feedback statistics
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select(`
            id,
            title,
            description,
            image_url,
            demo_url,
            github_url,
            tech_stack,
            featured,
            status
          `)
          .eq("featured", true)
          .limit(3);

        if (projectsError) throw projectsError;

        // Get feedback statistics for each project
        const projectsWithFeedback = await Promise.all(
          (projectsData || []).map(async (project) => {
            const { data: feedbackData, error: feedbackError } = await supabase
              .from("project_feedbacks")
              .select("rating, author_name, content, created_at")
              .eq("project_id", project.id)
              .eq("approved", true)
              .order("created_at", { ascending: false });

            if (feedbackError) {
              console.error("Error fetching feedback for project:", project.id, feedbackError);
              return {
                ...project,
                feedback_count: 0,
                average_rating: 0,
                latest_feedback: null,
              };
            }

            const ratings = feedbackData?.map(f => f.rating).filter(r => r !== null) || [];
            const averageRating = ratings.length > 0 
              ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
              : 0;

            return {
              ...project,
              feedback_count: feedbackData?.length || 0,
              average_rating: Math.round(averageRating * 10) / 10,
              latest_feedback: feedbackData?.[0] || null,
            };
          })
        );

        setProjects(projectsWithFeedback);
      } catch (error) {
        console.error("Error fetching projects with feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsWithFeedback();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
        <p className="text-muted-foreground">
          Check out these projects and share your feedback
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="group hover:shadow-lg transition-shadow">
            {project.image_url && (
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}

            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {project.title}
                  {project.featured && (
                    <Star className="inline ml-2 h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </CardTitle>
                <Badge
                  variant={project.status === "completed" ? "default" : "secondary"}
                >
                  {project.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm line-clamp-2">
                {project.description}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1">
                {project.tech_stack.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {project.tech_stack.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{project.tech_stack.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Feedback Summary */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {project.feedback_count} feedback{project.feedback_count !== 1 ? "s" : ""}
                  </span>
                  {project.average_rating > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1">
                        {renderStars(project.average_rating)}
                        <span className="text-sm text-muted-foreground">
                          ({project.average_rating})
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Latest Feedback Preview */}
                {project.latest_feedback && (
                  <div className="rounded bg-muted p-3 text-sm">
                    <div className="font-medium text-xs text-muted-foreground mb-1">
                      Latest feedback from {project.latest_feedback.author_name}
                    </div>
                    <p className="text-muted-foreground line-clamp-2">
                      "{project.latest_feedback.content}"
                    </p>
                    {project.latest_feedback.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(project.latest_feedback.rating)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" asChild className="flex-1">
                  <Link to={`/projects/${project.id}`}>
                    View Details
                  </Link>
                </Button>
                {project.demo_url && (
                  <Button size="sm" asChild className="flex-1">
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Demo
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button asChild variant="outline">
          <Link to="/projects">
            View All Projects
          </Link>
        </Button>
      </div>
    </div>
  );
}
