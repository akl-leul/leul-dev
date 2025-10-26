import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CommentActionsProps {
  commentId: number;
  approved: boolean;
  onUpdate: () => void;
}

export const CommentActions = ({
  commentId,
  approved,
  onUpdate,
}: CommentActionsProps) => {
  const { toast } = useToast();

  const handleApprove = async () => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ approved: true })
        .eq("id", commentId);

      if (error) throw error;

      toast({ title: "Comment approved!" });
      onUpdate();
    } catch (error) {
      console.error("Error approving comment:", error);
      toast({
        title: "Error",
        description: "Failed to approve comment",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({ title: "Comment deleted!" });
      onUpdate();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      {!approved && (
        <Button size="sm" variant="outline" onClick={handleApprove}>
          <Check className="h-4 w-4 mr-1" />
          Approve
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={handleDelete}>
        <X className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );
};
