import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Check, X, Reply, Trash2, Star, Search, Filter } from "lucide-react";

interface ProjectFeedback {
  id: string;
  project_id: string;
  user_id?: string | null;
  author_name: string;
  author_email?: string | null;
  rating?: number | null;
  content: string;
  approved: boolean;
  approved_at?: string | null;
  approved_by?: string | null;
  response_message?: string | null;
  responded_at?: string | null;
  responded_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  projects?: {
    title: string;
    description: string;
  };
}

interface Project {
  id: string;
  title: string;
  description: string;
}

export function AdminFeedbackManager() {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<ProjectFeedback[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [activeFeedback, setActiveFeedback] = useState<ProjectFeedback | null>(null);
  const [feedbackResponse, setFeedbackResponse] = useState("");
  const [feedbackResponseOpen, setFeedbackResponseOpen] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("project_feedbacks")
        .select(`
          *,
          projects (
            id,
            title,
            description
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast({
        title: "Error",
        description: "Failed to load feedbacks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, description")
        .order("title");

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchProjects();
  }, []);

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch = 
      feedback.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.projects?.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "approved" && feedback.approved) ||
      (statusFilter === "pending" && !feedback.approved);

    const matchesProject = 
      projectFilter === "all" || 
      feedback.project_id === projectFilter;

    return matchesSearch && matchesStatus && matchesProject;
  });

  const handleApprove = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from("project_feedbacks")
        .update({
          approved: true,
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", feedbackId);

      if (error) throw error;

      setFeedbacks((prev) =>
        prev.map((fb) =>
          fb.id === feedbackId ? { ...fb, approved: true, approved_at: new Date().toISOString() } : fb
        )
      );

      toast({
        title: "Success",
        description: "Feedback approved successfully",
      });
    } catch (error) {
      console.error("Error approving feedback:", error);
      toast({
        title: "Error",
        description: "Failed to approve feedback",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const { error } = await supabase
        .from("project_feedbacks")
        .delete()
        .eq("id", feedbackId);

      if (error) throw error;

      setFeedbacks((prev) => prev.filter((fb) => fb.id !== feedbackId));

      toast({
        title: "Success",
        description: "Feedback deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to delete feedback",
        variant: "destructive",
      });
    }
  };

  const handleRespond = async () => {
    if (!activeFeedback) return;

    try {
      const { error } = await supabase
        .from("project_feedbacks")
        .update({
          response_message: feedbackResponse,
          responded_at: new Date().toISOString(),
          responded_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", activeFeedback.id);

      if (error) throw error;

      setFeedbacks((prev) =>
        prev.map((fb) =>
          fb.id === activeFeedback.id
            ? { ...fb, response_message: feedbackResponse, responded_at: new Date().toISOString() }
            : fb
        )
      );

      setFeedbackResponseOpen(false);
      setFeedbackResponse("");
      setActiveFeedback(null);

      toast({
        title: "Success",
        description: "Response added successfully",
      });
    } catch (error) {
      console.error("Error responding to feedback:", error);
      toast({
        title: "Error",
        description: "Failed to add response",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getProjectTitle = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || "Unknown Project";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Project Feedback Management</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          Project Feedback Management ({filteredFeedbacks.length})
        </h2>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setProjectFilter("all");
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      {filteredFeedbacks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No feedback found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeedbacks.map((feedback) => (
            <Card key={feedback.id}>
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold text-sm">{feedback.author_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {getProjectTitle(feedback.project_id)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(feedback.created_at), "MMM dd, yyyy")}
                    </div>
                  </div>
                  <Badge
                    variant={feedback.approved ? "default" : "secondary"}
                    className={
                      feedback.approved
                        ? "bg-green-600 text-white"
                        : "bg-yellow-600 text-white"
                    }
                  >
                    {feedback.approved ? "Approved" : "Pending"}
                  </Badge>
                </div>

                {/* Rating */}
                {feedback.rating && (
                  <div className="flex items-center gap-1">
                    {renderStars(feedback.rating)}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({feedback.rating}/5)
                    </span>
                  </div>
                )}

                {/* Content */}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {feedback.content}
                </p>

                {/* Response */}
                {feedback.response_message && (
                  <div className="rounded bg-muted p-3 text-sm">
                    <div className="font-medium mb-1 text-blue-700">Response</div>
                    <div className="text-muted-foreground line-clamp-2">
                      {feedback.response_message}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {!feedback.approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(feedback.id)}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveFeedback(feedback);
                      setFeedbackResponse(feedback.response_message || "");
                      setFeedbackResponseOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Respond
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(feedback.id)}
                    className="bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Response Dialog */}
      <Dialog open={feedbackResponseOpen} onOpenChange={setFeedbackResponseOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Respond to {activeFeedback?.author_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded bg-muted p-3">
              <div className="text-sm font-medium mb-2">Original Feedback:</div>
              <div className="text-sm text-muted-foreground">
                {activeFeedback?.content}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedbackResponse">Your Response</Label>
              <Textarea
                id="feedbackResponse"
                className="min-h-[120px]"
                value={feedbackResponse}
                onChange={(e) => setFeedbackResponse(e.target.value)}
                placeholder="Write your response to this feedback..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setFeedbackResponseOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleRespond}>
                Send Response
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
