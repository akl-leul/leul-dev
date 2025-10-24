import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { usePageView } from "@/hooks/usePageView";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Share2,
  Copy,
  Heart,
  UserRoundPen,
  SquareArrowOutUpRight,
  MessageCircle,
  Reply,
  ThumbsUp,
} from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import {
  FaXTwitter,
  FaLinkedin,
  FaFacebook,
  FaWhatsapp,
  FaTelegram,
  FaReddit,
  FaEnvelope,
} from "react-icons/fa6";

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string;
  read_time: number;
  views: number;
  likes_count: number;
  slug: string;
}

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string;
  read_time: number;
}

interface Comment {
  id: number;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
  approved: boolean;
  parent_id?: number | null;
  replies_count: number;
  likes_count: number;
  replies?: Comment[];
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  usePageView();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from("posts")
          .select(
            "id, title, content, excerpt, featured_image, published_at, read_time, views, likes_count, slug",
          )
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle();

        if (error || !data) {
          setError("Post not found");
          return;
        }

        setPost(data);
        setLikesCount(data.likes_count || 0);

        // Check if user has liked this post
        const userSessionKey = `liked_post_${data.id}`;
        const hasLiked = localStorage.getItem(userSessionKey) === "true";
        setLiked(hasLiked);

        // Increment view count
        await supabase
          .from("posts")
          .update({ views: data.views + 1 })
          .eq("id", data.id);

        // Fetch related posts
        const { data: related } = await supabase
          .from("posts")
          .select(
            "id, title, slug, excerpt, featured_image, published_at, read_time",
          )
          .eq("published", true)
          .neq("id", data.id)
          .order("published_at", { ascending: false })
          .limit(3);

        if (related) {
          setRelatedPosts(related);
        }

        // Fetch comments with replies
        const { data: commentsData } = await supabase
          .from("comments")
          .select("*")
          .eq("post_id", data.id)
          .eq("approved", true)
          .order("created_at", { ascending: false });

        if (commentsData) {
          // Organize comments into threads (parent comments with their replies)
          const parentComments = commentsData.filter(
            (comment) => !comment.parent_id,
          );
          const replies = commentsData.filter((comment) => comment.parent_id);

          // Attach replies to their parent comments
          const organizedComments = parentComments.map((parent) => ({
            ...parent,
            replies: replies.filter((reply) => reply.parent_id === parent.id),
          }));

          setComments(organizedComments);

          // Check which comments the user has liked
          const anonUserId = getAnonUserId();
          const { data: likesData } = await supabase
            .from("comment_likes")
            .select("comment_id")
            .eq("user_id", anonUserId)
            .in(
              "comment_id",
              commentsData.map((c) => c.id),
            );

          if (likesData) {
            const likesMap: Record<number, boolean> = {};
            likesData.forEach((like) => {
              likesMap[like.comment_id] = true;
            });
            setCommentLikes(likesMap);
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Generate or reuse anonymous user id once
  const getAnonUserId = () => {
    let userId = localStorage.getItem("anon_user_id");
    if (!userId) {
      userId = crypto.randomUUID(); // unique ID
      localStorage.setItem("anon_user_id", userId);
    }
    return userId;
  };

  const handleLike = async () => {
    if (!post) return;

    const anonUserId = getAnonUserId();

    try {
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", anonUserId);

        if (error) throw error;

        setLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
        toast({ title: "Removed like", description: "You unliked this post." });
      } else {
        // Like
        const { error } = await supabase.from("post_likes").insert({
          post_id: post.id,
          user_id: anonUserId,
        });

        if (error) throw error;

        setLiked(true);
        setLikesCount((prev) => prev + 1);
        toast({ title: "Liked!", description: "You liked this post." });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Sorry",
        description: "You have already liked it.",
        variant: "destructive",
      });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !post ||
      !commentName.trim() ||
      !commentEmail.trim() ||
      !commentContent.trim()
    )
      return;

    setSubmittingComment(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        author_name: commentName.trim(),
        author_email: commentEmail.trim(),
        content: commentContent.trim(),
        user_id: null,
        approved: false,
      });

      if (error) throw error;

      toast({
        title: "Comment submitted!",
        description: "Your comment is awaiting approval.",
      });

      setCommentName("");
      setCommentEmail("");
      setCommentContent("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit comment.",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (
      !post ||
      !commentName.trim() ||
      !commentEmail.trim() ||
      !replyContent.trim()
    )
      return;

    setSubmittingReply(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        parent_id: parentId,
        author_name: commentName.trim(),
        author_email: commentEmail.trim(),
        content: replyContent.trim(),
        user_id: null,
        approved: false,
      });

      if (error) throw error;

      toast({
        title: "Reply submitted!",
        description: "Your reply is awaiting approval.",
      });

      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast({
        title: "Error",
        description: "Failed to submit reply.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const updateCommentInState = (
    comments: Comment[],
    commentId: number,
    updateFn: (comment: Comment) => Comment,
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return updateFn(comment);
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInState(comment.replies, commentId, updateFn),
        };
      }
      return comment;
    });
  };

  const handleCommentLike = async (commentId: number) => {
    const anonUserId = getAnonUserId();
    const isLiked = !!commentLikes[commentId];

    // Optimistic UI update
    setCommentLikes((prev) => ({ ...prev, [commentId]: !isLiked }));

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", anonUserId);
        if (error) throw error;
        toast({
          title: "Removed like",
          description: "You unliked this comment.",
        });
      } else {
        // Like
        const { error } = await supabase
          .from("comment_likes")
          .insert({ comment_id: commentId, user_id: anonUserId });
        if (error) throw error;
        toast({ title: "Liked!", description: "You liked this comment." });
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
      toast({
        title: "Error",
        description: "Failed to update like.",
        variant: "destructive",
      });

      // Rollback optimistic update on failure
      setCommentLikes((prev) => ({ ...prev, [commentId]: isLiked }));
    }
  };

  useEffect(() => {
    if (post) {
      document.title = `${post.title} - Leul Ayfokru`;
      const meta = document.querySelector('meta[name="description"]');
      meta?.setAttribute("content", post.excerpt || post.title);
    }
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
              <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
              <div className="aspect-video bg-muted rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center ">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {error || "Post Not Found"}
            </h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist or has been
              removed.
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-8 mt-8">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>

          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article>
                {/* Post Header */}
                <header className="mb-12">
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    {post.title}
                  </h1>

                  {/* Post Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(post.published_at), "MMMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{post.read_time} min read</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{post.views} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserRoundPen className="h-4 w-4" />{" "}
                      <span>by Leul Ayfokru</span>
                    </div>
                  </div>

                  {/* Tags - Remove for now until we implement proper tag relationships */}

                  {/* Featured Image */}
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden rounded-lg mb-8">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </header>

                {/* Post Content */}
                <Card>
                  <CardContent className="p-8">
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-3xl font-bold text-foreground mt-8 mb-4 first:mt-0">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-2xl font-semibold text-foreground mt-6 mb-3">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-muted-foreground leading-relaxed mb-4">
                              {children}
                            </p>
                          ),
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                {children}
                              </code>
                            ) : (
                              <code className={className}>{children}</code>
                            );
                          },
                          pre: ({ children }) => (
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                              {children}
                            </pre>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                              {children}
                            </blockquote>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside text-muted-foreground mb-4 space-y-1">
                              {children}
                            </ol>
                          ),
                          a: ({ children, href }) => (
                            <a
                              href={href}
                              className="inline-flex items-center gap-1 text-primary hover:text-primary/80
 hover:underline whitespace-nowrap"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {children}
                              <SquareArrowOutUpRight className="h-4 w-4" />
                            </a>
                          ),
                        }}
                      >
                        {post.content}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>

                {/* Share Section */}
                <section className="mt-8">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Share2 className="h-4 w-4" /> Share this post
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {/* Twitter/X */}
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <FaXTwitter className="h-4 w-4" />
                      </a>
                    </Button>

                    {/* LinkedIn */}
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <FaLinkedin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </a>
                    </Button>

                    {/* Facebook */}
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <FaFacebook className="h-4 w-4 text-blue-500" />
                      </a>
                    </Button>

                    {/* WhatsApp */}
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <FaWhatsapp className="h-4 w-4 text-green-500" />
                      </a>
                    </Button>

                    {/* Telegram */}
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <FaTelegram className="h-4 w-4 text-sky-500" />
                      </a>
                    </Button>

                    {/* Reddit */}
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://www.reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <FaReddit className="h-4 w-4 text-orange-500" />
                      </a>
                    </Button>

                    {/* Email */}
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(window.location.href)}`}
                        className="flex items-center gap-2"
                      >
                        <FaEnvelope className="h-4 w-4" />
                      </a>
                    </Button>

                    {/* Copy Link */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigator.clipboard.writeText(window.location.href)
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    {/* Like Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className={`flex items-center gap-2 ${
                        liked ? "text-red-500" : "text-muted-foreground"
                      } hover:text-red-500`}
                    >
                      {liked ? (
                        <Heart className="h-4 w-4 fill-current" />
                      ) : (
                        <Heart className="h-4 w-4" />
                      )}
                      <span>{likesCount}</span>
                    </Button>
                  </div>
                </section>

                {/* Comments Section */}
                <section className="mt-12">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <MessageCircle className="h-6 w-6" />
                    Comments ({comments.length})
                  </h3>

                  {/* Comment Form */}
                  <Card className="mb-8">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-4">
                        Leave a Comment
                      </h4>
                      <form
                        onSubmit={handleCommentSubmit}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                              id="name"
                              value={commentName}
                              onChange={(e) => setCommentName(e.target.value)}
                              placeholder="Your name"
                              required
                              maxLength={100}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={commentEmail}
                              onChange={(e) => setCommentEmail(e.target.value)}
                              placeholder="your@email.com"
                              required
                              maxLength={255}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="comment">Comment *</Label>
                          <Textarea
                            id="comment"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Share your thoughts..."
                            required
                            rows={4}
                            maxLength={1000}
                          />
                        </div>
                        <Button type="submit" disabled={submittingComment}>
                          {submittingComment
                            ? "Submitting..."
                            : "Submit Comment"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                          No comments yet. Be the first to comment!
                        </CardContent>
                      </Card>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="space-y-3">
                          {/* Main Comment */}
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary font-semibold">
                                    {comment.author_name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold">
                                      {comment.author_name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {format(
                                        new Date(comment.created_at),
                                        "MMM dd, yyyy",
                                      )}
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground mb-3">
                                    {comment.content}
                                  </p>

                                  {/* Comment Actions */}
                                  <div className="flex items-center gap-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleCommentLike(comment.id)
                                      }
                                      className={`flex items-center gap-1 ${
                                        commentLikes[comment.id]
                                          ? "text-red-500"
                                          : "text-muted-foreground"
                                      } hover:text-red-500`}
                                    >
                                      {commentLikes[comment.id] ? (
                                        <ThumbsUp className="h-4 w-4 fill-current" />
                                      ) : (
                                        <ThumbsUp className="h-4 w-4" />
                                      )}
                                      <span>{comment.likes_count}</span>
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setReplyingTo(
                                          replyingTo === comment.id
                                            ? null
                                            : comment.id,
                                        )
                                      }
                                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                                    >
                                      <Reply className="h-4 w-4" />
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Reply Form */}
                          {replyingTo === comment.id && (
                            <Card className="ml-8">
                              <CardContent className="p-4">
                                <h5 className="font-semibold mb-3">
                                  Reply to {comment.author_name}
                                </h5>
                                <div className="space-y-3">
                                  <Textarea
                                    value={replyContent}
                                    onChange={(e) =>
                                      setReplyContent(e.target.value)
                                    }
                                    placeholder="Write your reply..."
                                    rows={3}
                                    maxLength={500}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleReplySubmit(comment.id)
                                      }
                                      disabled={
                                        submittingReply || !replyContent.trim()
                                      }
                                    >
                                      {submittingReply
                                        ? "Submitting..."
                                        : "Submit Reply"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setReplyingTo(null);
                                        setReplyContent("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-8 space-y-3">
                              {comment.replies.map((reply) => (
                                <Card key={reply.id}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-primary font-semibold text-sm">
                                          {reply.author_name
                                            .charAt(0)
                                            .toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="font-semibold text-sm">
                                            {reply.author_name}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {format(
                                              new Date(reply.created_at),
                                              "MMM dd, yyyy",
                                            )}
                                          </span>
                                        </div>
                                        <p className="text-muted-foreground text-sm mb-2">
                                          {reply.content}
                                        </p>

                                        {/* Reply Actions */}
                                        <div className="flex items-center gap-3">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleCommentLike(reply.id)
                                            }
                                            className={`flex items-center gap-1 text-xs ${
                                              commentLikes[reply.id]
                                                ? "text-red-500"
                                                : "text-muted-foreground"
                                            } hover:text-red-500`}
                                          >
                                            {commentLikes[reply.id] ? (
                                              <ThumbsUp className="h-3 w-3 fill-current" />
                                            ) : (
                                              <ThumbsUp className="h-3 w-3" />
                                            )}
                                            <span>{reply.likes_count}</span>
                                          </Button>

                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              setReplyingTo(
                                                replyingTo === reply.id
                                                  ? null
                                                  : reply.id,
                                              )
                                            }
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                          >
                                            <Reply className="h-3 w-3" />
                                            Reply
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Post Footer */}
                <footer className="mt-12 pt-8 border-t border-border">
                  <div className="flex justify-between items-center">
                    <Button variant="outline" asChild>
                      <Link to="/blog">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        More Posts
                      </Link>
                    </Button>

                    <div className="text-sm text-muted-foreground">
                      Published on{" "}
                      {format(new Date(post.published_at), "MMMM dd, yyyy")} by
                      Leul Ayfokru
                    </div>
                  </div>
                </footer>
              </article>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Related Posts
                    </h3>
                    {relatedPosts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No related posts yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {relatedPosts.map((relatedPost) => (
                          <Link
                            key={relatedPost.id}
                            to={`/blog/${relatedPost.slug}`}
                            className="block group"
                          >
                            <div className="space-y-2">
                              {relatedPost.featured_image && (
                                <div className="aspect-video rounded overflow-hidden">
                                  <img
                                    src={relatedPost.featured_image}
                                    alt={relatedPost.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                </div>
                              )}
                              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                                {relatedPost.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {format(
                                  new Date(relatedPost.published_at),
                                  "MMM dd, yyyy",
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
