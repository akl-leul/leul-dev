import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const feedbackSchema = z.object({
  author_name: z.string().min(1, "Name is required"),
  author_email: z.string().email("Valid email is required").optional().or(z.literal("")),
  rating: z.number().min(1).max(5).optional(),
  content: z.string().min(10, "Feedback must be at least 10 characters"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

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
}

interface ProjectFeedbackProps {
  projectId: string;
  projectTitle: string;
  showForm?: boolean;
  showFeedbacks?: boolean;
}

export function ProjectFeedback({ 
  projectId, 
  projectTitle, 
  showForm = true, 
  showFeedbacks = true 
}: ProjectFeedbackProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<ProjectFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      author_name: user?.user_metadata?.name || "",
      author_email: user?.email || "",
    },
  });

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("project_feedbacks")
        .select("*")
        .eq("project_id", projectId)
        .eq("approved", true)
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

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setSubmitting(true);
      
      const feedbackData = {
        project_id: projectId,
        user_id: user?.id || null,
        author_name: data.author_name,
        author_email: data.author_email || null,
        rating: selectedRating,
        content: data.content,
      };

      const { error } = await supabase
        .from("project_feedbacks")
        .insert(feedbackData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Thank you for your feedback! It will be reviewed before being published.",
      });

      reset();
      setSelectedRating(null);
      
      // Refresh feedbacks if showing them
      if (showFeedbacks) {
        fetchFeedbacks();
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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

  const renderRatingInput = () => {
    return (
      <div className="space-y-2">
        <Label>Rating (Optional)</Label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedRating(i + 1)}
              className="transition-colors hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  i < (selectedRating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300 hover:text-yellow-300"
                }`}
              />
            </button>
          ))}
        </div>
        {selectedRating && (
          <p className="text-sm text-muted-foreground">
            {selectedRating} star{selectedRating !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    );
  };

  // Load feedbacks on component mount if showing them
  useState(() => {
    if (showFeedbacks) {
      fetchFeedbacks();
    }
  });

  return (
    <div className="space-y-6">
      {/* Feedback Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Share Your Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Input
        id="author_name"
        {...register("author_name")}
        placeholder="Your name"
      />
      {errors.author_name && (
        <p className="text-sm text-red-500">{errors.author_name.message}</p>
      )}
    </div>

    <div>
      <Input
        id="author_email"
        type="email"
        {...register("author_email")}
        placeholder="your@email.com"
      />
      {errors.author_email && (
        <p className="text-sm text-red-500">{errors.author_email.message}</p>
      )}
    </div>
  </div>

  {renderRatingInput()}

  <div>
    <Textarea
      id="content"
      {...register("content")}
      placeholder="Share your thoughts about this project..."
      rows={4}
    />
    {errors.content && (
      <p className="text-sm text-red-500">{errors.content.message}</p>
    )}
  </div>

  <Button type="submit" disabled={submitting} className="w-full">
    {submitting ? "Submitting..." : "Submit Feedback"}
  </Button>
</form>

          </CardContent>
        </Card>
      )}

      {/* Feedback Display */}
      {showFeedbacks && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Project Feedback</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFeedbacks}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : feedbacks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No feedback yet. Be the first to share your thoughts!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <Card key={feedback.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{feedback.author_name}</span>
                            {feedback.rating && (
                              <div className="flex items-center gap-1">
                                {renderStars(feedback.rating)}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(feedback.created_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Approved
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {feedback.content}
                      </p>

                      {feedback.response_message && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsUp className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-700">Project Owner Response</span>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {feedback.response_message}
                          </p>
                          {feedback.responded_at && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Responded on {format(new Date(feedback.responded_at), "MMM dd, yyyy")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
