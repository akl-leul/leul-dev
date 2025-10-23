import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { usePageView } from "@/hooks/usePageView";
import { ExternalLink, Github, Search, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

const Projects = () => {
  usePageView("Projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTech, setSelectedTech] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });
        setProjects(data || []);
        setFilteredProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedTech) {
      filtered = filtered.filter((project) =>
        project.tech_stack.some((tech) =>
          tech.toLowerCase().includes(selectedTech.toLowerCase()),
        ),
      );
    }

    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [projects, searchTerm, selectedTech]);

  const allTechnologies = Array.from(
    new Set(projects.flatMap((project) => project.tech_stack)),
  ).sort();

  if (loading) {
    return (
      <main className="min-h-screen py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="max-w-6xl mx-auto animate-pulse">
            <div className="h-10 bg-muted rounded w-1/3 mb-10 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-muted rounded-lg h-72" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 mt-8">
            My Projects
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A collection of projects I've worked on, showcasing various
            technologies and skills
          </p>
        </div>

        {/* Search and filter */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:gap-4 space-y-4 md:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTech === "" ? "default" : "outline"}
              onClick={() => setSelectedTech("")}
              size="sm"
            >
              All
            </Button>
            {allTechnologies.slice(0, 5).map((tech) => (
              <Button
                key={tech}
                variant={selectedTech === tech ? "default" : "outline"}
                onClick={() =>
                  setSelectedTech(selectedTech === tech ? "" : tech)
                }
                size="sm"
              >
                {tech}
              </Button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground text-lg">
              {projects.length === 0
                ? "No projects added yet. Projects will be displayed here once they're added to the database."
                : "No projects found matching your criteria."}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProjects.map((project) => (
                <Card key={project.id} className="group">
                  {project.image_url ? (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center text-muted-foreground text-sm">
                      No Image
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg cursor-default group-hover:text-primary transition-colors">
                        {project.title}
                        {project.featured && (
                          <Star className="inline ml-2 h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </CardTitle>
                      <Badge
                        variant={
                          project.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {project.tech_stack.slice(0, 4).map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {project.tech_stack.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tech_stack.length - 4} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" asChild className="flex-1">
                        <Link to={`/projects/${project.id}`} className="flex items-center justify-center gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                      {project.github_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="flex-1"
                        >
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <Github className="h-4 w-4" />
                            Code
                          </a>
                        </Button>
                      )}
                      {project.demo_url && (
                        <Button size="sm" asChild className="flex-1">
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Live Demo
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={
                          currentPage === 1
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages)
                            setCurrentPage(currentPage + 1);
                        }}
                        className={
                          currentPage === totalPages
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredProjects.length)} of{" "}
              {filteredProjects.length} projects
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Projects;
