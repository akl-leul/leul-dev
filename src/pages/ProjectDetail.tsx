import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Star, ArrowLeft, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProjectFeedback } from "@/components/ProjectFeedback";
import { Link } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { ShareDropdown } from "@/components/ui/share-dropdown";
import { motion } from "framer-motion";

interface Project {
  id: string;
  title: string;
  description: string;
  content: string | null;
  image_url: string | null;
  gallery_images: string[] | null;
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allImages = project ? [
    ...(project.image_url ? [project.image_url] : []),
    ...(project.gallery_images || [])
  ] : [];

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

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (loading) {
    return (
      <main className="min-h-screen py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="animate-pulse space-y-6 mt-16">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-96 bg-muted rounded-xl" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <Card3D className="mt-24">
            <Card3DContent className="p-8 text-center">
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
            </Card3DContent>
          </Card3D>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Back Button */}
        <motion.div 
          className="mb-6 mt-16"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button variant="outline" asChild>
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </motion.div>

        {/* Hero Section with Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {allImages.length > 0 && (
            <Card3D className="mb-8 overflow-hidden">
              <div className="relative group">
                <motion.img
                  src={allImages[currentImageIndex]}
                  alt={`${project.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-72 sm:h-96 lg:h-[28rem] object-cover cursor-pointer"
                  onClick={() => openLightbox(currentImageIndex)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 left-4 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => openLightbox(currentImageIndex)}
                >
                  <Expand className="h-4 w-4" />
                </Button>
                
                {allImages.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-lg"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-lg"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? 'bg-primary scale-125' 
                              : 'bg-muted-foreground/50 hover:bg-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-background/80 px-3 py-1.5 rounded-full text-sm font-medium">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>
            </Card3D>
          )}
        </motion.div>

        {/* Thumbnail Strip */}
        {allImages.length > 1 && (
          <motion.div 
            className="mb-8 flex gap-3 overflow-x-auto pb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {allImages.map((img, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                onDoubleClick={() => openLightbox(index)}
                className={`shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  index === currentImageIndex ? 'border-primary shadow-lg scale-105' : 'border-transparent hover:border-muted-foreground/30'
                }`}
                whileHover={{ scale: 1.05 }}
                title="Double-click to open fullscreen"
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-24 h-16 object-cover"
                />
              </motion.button>
            ))}
          </motion.div>
        )}

        <ImageLightbox
          images={allImages}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          alt={project.title}
        />

        {/* Project Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card3D className="mb-8">
            <Card3DHeader>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <Card3DTitle className="text-3xl md:text-4xl mb-3">
                    {project.title}
                    {project.featured && (
                      <Star className="inline ml-3 h-7 w-7 text-yellow-500 fill-current" />
                    )}
                  </Card3DTitle>
                  <Badge
                    variant={project.status === "completed" ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {project.status}
                  </Badge>
                </div>
                <ShareDropdown
                  title={project.title}
                  description={project.description}
                />
              </div>
            </Card3DHeader>
            <Card3DContent className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-3">
                {project.github_url && (
                  <Button asChild size="lg">
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Github className="h-5 w-5" />
                      View Code
                    </a>
                  </Button>
                )}
                {project.demo_url && (
                  <Button variant="outline" asChild size="lg">
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-5 w-5" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </div>
            </Card3DContent>
          </Card3D>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card3D className="mb-8">
            <Card3DHeader>
              <Card3DTitle>Technologies Used</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech, index) => (
                  <motion.div
                    key={tech}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {tech}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </Card3DContent>
          </Card3D>
        </motion.div>

        {/* Project Content */}
        {project.content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card3D className="mb-8">
              <Card3DHeader>
                <Card3DTitle>About This Project</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(
                      project.content.startsWith('<') 
                        ? project.content 
                        : marked(project.content) as string
                    )
                  }}
                />
              </Card3DContent>
            </Card3D>
          </motion.div>
        )}

        {/* Feedback Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <ProjectFeedback 
            projectId={project.id} 
            projectTitle={project.title}
            showForm={true}
            showFeedbacks={true}
          />
        </motion.div>
      </div>
    </main>
  );
};

export default ProjectDetail;
