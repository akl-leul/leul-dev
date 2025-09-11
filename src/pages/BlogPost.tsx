import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Clock, Eye, Share2, Copy, Heart } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';

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
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, content, excerpt, featured_image, published_at, read_time, views, likes_count')
          .eq('slug', slug)
          .eq('published', true)
          .maybeSingle();

        if (error || !data) {
          setError('Post not found');
          return;
        }

        setPost(data);
        setLikesCount(data.likes_count || 0);

        // Check if user has liked this post
        const anonUserId = getAnonUserId();
        const { data: likeData } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', data.id)
          .eq('user_id', anonUserId)
          .maybeSingle();

        setLiked(!!likeData);

        // Increment view count
        await supabase
          .from('posts')
          .update({ views: data.views + 1 })
          .eq('id', data.id);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
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
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', anonUserId);

        if (error) throw error;

        // Update likes_count in posts table
        await supabase
          .from('posts')
          .update({ likes_count: Math.max(0, likesCount - 1) })
          .eq('id', post.id);

        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        toast({ title: 'Removed like', description: 'You unliked this post.' });
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: anonUserId
          });

        if (error) throw error;

        // Update likes_count in posts table
        await supabase
          .from('posts')
          .update({ likes_count: likesCount + 1 })
          .eq('id', post.id);

        setLiked(true);
        setLikesCount(prev => prev + 1);
        toast({ title: 'Liked!', description: 'You liked this post.' });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({ title: 'Error', description: 'Failed to update like status.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (post) {
      document.title = `${post.title} - Leul Ayfokru`;
      const meta = document.querySelector('meta[name="description"]');
      meta?.setAttribute('content', post.excerpt || post.title);
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
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {error || 'Post Not Found'}
            </h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist or has been removed.
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
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>

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
                  <span>{format(new Date(post.published_at), 'MMMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.read_time} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{post.views} views</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${liked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
                >
                  {liked ? <Heart className="h-4 w-4 fill-current" /> : <Heart className="h-4 w-4" />}
                  <span>{likesCount}</span>
                </Button>
              </div>

              {/* Featured Image */}
              {post.featureed_image && (
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
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Share Section */}
            <section className="mt-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Share this post
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    X / Twitter
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copy link
                </Button>
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
                  Published on {format(new Date(post.published_at), 'MMMM dd, yyyy')}
                </div>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;