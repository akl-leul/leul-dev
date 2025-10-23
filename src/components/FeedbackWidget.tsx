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
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
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

interface FeedbackWidgetProps {
  projectId: string;
  projectTitle: string;
  compact?: boolean;
  showLatest?: boolean;
  maxLatest?: number;
}

export function FeedbackWidget({ 
  projectId, 
  projectTitle, 
  compact = false,
  showLatest = true,
  maxLatest = 3
}: FeedbackWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<ProjectFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

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
        .order("created_at", { ascending: false })
        .limit(maxLatest);

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
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
      setShowForm(false);
      
      // Refresh feedbacks
      if (showLatest) {
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
                className={`h-5 w-5 ${
                  i < (selectedRating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300 hover:text-yellow-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Load feedbacks on component mount if showing them
  useState(() => {
    if (showLatest) {
      fetchFeedbacks();
    }
  });

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">Feedback</span>
            {feedbacks.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {feedbacks.length}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Leave Feedback"}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    {...register("author_name")}
                    placeholder="Your name"
                    className="text-sm"
                  />
                  <Input
                    type="email"
                    {...register("author_email")}
                    placeholder="Email (optional)"
                    className="text-sm"
                  />
                </div>
                {renderRatingInput()}
                <Textarea
                  {...register("content")}
                  placeholder="Share your thoughts..."
                  rows={2}
                  className="text-sm"
                />
                <Button type="submit" disabled={submitting} size="sm" className="w-full">
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {showLatest && feedbacks.length > 0 && (
          <div className="space-y-2">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="text-sm border-l-2 border-muted pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{feedback.author_name}</span>
                  {feedback.rating && (
                    <div className="flex items-center gap-1">
                      {renderStars(feedback.rating)}
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground line-clamp-2">
                  {feedback.content}
                </p>
                {feedback.response_message && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <div className="flex items-center gap-1 mb-1">
                      <ThumbsUp className="h-3 w-3 text-blue-500" />
                      <span className="font-medium text-blue-700">Response</span>
                    </div>
                    <p className="text-blue-600">{feedback.response_message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedback for {projectTitle}
        </h3>
        <Button
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Leave Feedback"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Share Your Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author_name">Name *</Label>
                  <Input
                    id="author_name"
                    {...register("author_name")}
                    placeholder="Your name"
                  />
                  {errors.author_name && (
                    <p className="text-sm text-red-500">{errors.author_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author_email">Email (Optional)</Label>
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

              <div className="space-y-2">
                <Label htmlFor="content">Your Feedback *</Label>
                <Textarea
                  id="content"
                  {...register("content")}
                  placeholder="Share your thoughts about this project..."
                  rows={3}
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

      {showLatest && (
        <div className="space-y-3">
          <h4 className="font-medium">Latest Feedback</h4>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : feedbacks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No feedback yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{feedback.author_name}</span>
                        {feedback.rating && (
                          <div className="flex items-center gap-1">
                            {renderStars(feedback.rating)}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(feedback.created_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      Approved
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {feedback.content}
                  </p>

                  {feedback.response_message && (
                    <div className="mt-3 p-2 bg-blue-50 rounded">
                      <div className="flex items-center gap-1 mb-1">
                        <ThumbsUp className="h-3 w-3 text-blue-500" />
                        <span className="text-xs font-medium text-blue-700">Project Owner Response</span>
                      </div>
                      <p className="text-xs text-blue-600">
                        {feedback.response_message}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
