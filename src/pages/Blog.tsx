import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Search, Tag, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string;
  read_time: number;
  views: number;
}

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, title, slug, excerpt, featured_image, published_at, read_time, views')
          .eq('published', true)
          .order('published_at', { ascending: false });

        setPosts(postsData || []);
        setFilteredPosts(postsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    document.title = 'Blog - Leul Ayfokru';
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute('content', 'Read articles and tutorials by Leul Ayfokru, full-stack developer based in Ethiopia.');
  }, []);

  useEffect(() => {
    let filtered = posts;
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTag) {
      // Tag filtering logic pending proper implementation
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [posts, searchTerm, selectedTag]);

  // Placeholder: tags will be implemented when relation is added
  const allTags: string[] = [];

  if (loading) {
    return (
      <div className="min-h-screen py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="animate-pulse max-w-6xl mx-auto">
            <div className="h-10 bg-gray-300 rounded w-1/3 mb-10 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-gray-200 rounded-lg h-80" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="relative text-center mb-20 bg-gradient-to-b from-indigo-50 via-white to-indigo-100 rounded-3xl py-24 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="md:w-[200%] h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-[180px] opacity-25"></div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 drop-shadow-md mb-3 md:mb-4 dark:text-gray-100">
            Blog
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-gray-900 drop-shadow-md dark:text-gray-300 px-4">
            Thoughts, tutorials, and insights from my{' '}
            <span className="font-semibold">development journey</span>.
          </p>
          <div className="mt-4 md:mt-6 flex justify-center">
            <div className="h-1 w-20 md:w-24 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full shadow-lg shadow-pink-500/30"></div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:gap-4 space-y-3 md:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <Button
              variant={selectedTag === '' ? 'default' : 'outline'}
              onClick={() => setSelectedTag('')}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">All Tags</span>
              <span className="xs:hidden">All</span>
            </Button>
            {allTags.slice(0, 4).map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                size="sm"
                className="text-xs sm:text-sm"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-600 text-lg">
              {posts.length === 0
                ? 'No blog posts published yet. Posts will appear here once they\'re published.'
                : 'No posts found matching your criteria.'}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 rounded-lg border border-gray-200 bg-white">
                  {post.featured_image ? (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.published_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.read_time} min read
                      </div>
                    </div>

                    <CardTitle className="group-hover:text-indigo-600 transition-colors text-lg font-semibold">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </CardTitle>

                    {post.excerpt && (
                      <CardDescription className="line-clamp-3 text-gray-700">{post.excerpt}</CardDescription>
                    )}
                  </CardHeader>

                  <CardContent>
                    <Button variant="outline" size="sm" asChild className="w-full group">
                      <Link to={`/blog/${post.slug}`} className="flex items-center justify-center gap-2">
                        Read More
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center overflow-x-auto px-2">
                <Pagination>
                  <PaginationContent className="flex-wrap justify-center gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 5) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                        return false;
                      })
                      .map((page, index, array) => {
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <PaginationItem>
                                <span className="px-2">...</span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                                className="min-w-[2.5rem]"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Results summary */}
            <div className="mt-4 text-center text-xs sm:text-sm text-gray-500 px-4">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length} posts
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;
