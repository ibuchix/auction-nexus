import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DisputeComment } from "@/types/disputes";
import { formatDistance } from "date-fns";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DisputeCommentsProps {
  disputeId: string;
  onNewComment: () => void;
}

export function DisputeComments({ disputeId, onNewComment }: DisputeCommentsProps) {
  const [comments, setComments] = useState<DisputeComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [disputeId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('dispute_comments')
        .select(`
          *,
          author_id:profiles!dispute_comments_author_id_fkey(id, full_name, avatar_url)
        `)
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setComments(data as DisputeComment[]);
    } catch (error: any) {
      toast({
        title: "Error fetching comments",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // In a real application, you would get the current admin user ID
      const adminId = "00000000-0000-0000-0000-000000000000"; // Placeholder admin ID
      
      const { error } = await supabase
        .from('dispute_comments')
        .insert({
          dispute_id: disputeId,
          content: newComment.trim(),
          author_id: adminId
        });
        
      if (error) throw error;
      
      setNewComment("");
      onNewComment();
      fetchComments();
      
      toast({
        title: "Comment added",
        description: "Your comment has been added to the dispute",
      });
    } catch (error: any) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.length === 0 ? (
        <p className="text-center py-4 text-gray-500">No comments yet</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author_id?.avatar_url || ''} />
                <AvatarFallback>{getInitials(comment.author_id?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">
                    {comment.author_id?.full_name || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistance(new Date(comment.created_at), new Date(), { addSuffix: true })}
                  </p>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="space-y-3 pt-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmitComment} 
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Comment
          </Button>
        </div>
      </div>
    </div>
  );
}
