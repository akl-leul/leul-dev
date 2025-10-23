import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Star, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProjectFeedback } from "@/components/ProjectFeedback";
import { Link } from "react-router-dom";

interface Project {
  id: string;
  title: string;
  description: string;
  content: string | null;
  image_url: string | null;
  github_url: string | null;
  demo_url: string | null;
  tech_stack: string[];
  featured: boolean;
  status: string;
  created_at: string;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The project you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/projects">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {project.title}
                {project.featured && (
                  <Star className="inline ml-2 h-8 w-8 text-yellow-500 fill-current" />
                )}
              </h1>
              <Badge
                variant={project.status === "completed" ? "default" : "secondary"}
                className="mb-4"
              >
                {project.status}
              </Badge>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground mb-6">
            {project.description}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            {project.github_url && (
              <Button asChild>
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  View Code
                </a>
              </Button>
            )}
            {project.demo_url && (
              <Button variant="outline" asChild>
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Project Image */}
        {project.image_url && (
          <Card className="mb-8">
            <CardContent className="p-0">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Tech Stack */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Technologies Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack.map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Content */}
        {project.content && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About This Project</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            </CardContent>
          </Card>
        )}

        {/* Feedback Section */}
        <ProjectFeedback 
          projectId={project.id} 
          projectTitle={project.title}
          showForm={true}
          showFeedbacks={true}
        />
      </div>
    </main>
  );
};

export default ProjectDetail;
