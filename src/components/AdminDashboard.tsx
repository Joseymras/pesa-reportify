
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, Save, Eye, Globe, BarChart4, RefreshCw, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author_id: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
};

type FinancialNews = {
  id: string;
  title: string;
  content: string;
  source: string | null;
  publish_date: string;
  category: string | null;
  display_on_marquee: boolean;
  auto_blog_post: boolean;
};

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [financialNews, setFinancialNews] = useState<FinancialNews[]>([]);
  const [activeTab, setActiveTab] = useState("blog");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error || !data) {
          navigate('/dashboard');
          toast.error("You don't have admin privileges");
          return;
        }
        
        setIsAdmin(true);
        fetchBlogPosts();
        fetchFinancialNews();
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
    }
  };

  const fetchFinancialNews = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_news')
        .select('*')
        .order('publish_date', { ascending: false });
        
      if (error) throw error;
      setFinancialNews(data || []);
    } catch (error) {
      console.error('Error fetching financial news:', error);
      toast.error('Failed to load financial news');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Should never get here because of the redirect in useEffect
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            fetchBlogPosts();
            fetchFinancialNews();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:flex md:w-auto">
          <TabsTrigger value="blog">Blog Management</TabsTrigger>
          <TabsTrigger value="news">Financial News</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="blog" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Blog Posts</CardTitle>
                <CardDescription>Manage your blog posts and SEO settings</CardDescription>
              </div>
              <Button onClick={() => navigate('/admin/blog/new')}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogPosts.length > 0 ? (
                    blogPosts.map(post => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>
                          <span className={`rounded-full px-2 py-1 text-xs ${
                            post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {post.status}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No blog posts yet. Click "New Post" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="news" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Financial News</CardTitle>
                <CardDescription>Manage news items for the marquee ticker</CardDescription>
              </div>
              <Button onClick={() => navigate('/admin/news/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add News
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>On Marquee</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialNews.length > 0 ? (
                    financialNews.map(news => (
                      <TableRow key={news.id}>
                        <TableCell className="font-medium">{news.title}</TableCell>
                        <TableCell>{news.source || '-'}</TableCell>
                        <TableCell>{new Date(news.publish_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {news.display_on_marquee ? (
                            <span className="rounded-full px-2 py-1 text-xs bg-green-100 text-green-800">Yes</span>
                          ) : (
                            <span className="rounded-full px-2 py-1 text-xs bg-gray-100 text-gray-800">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No news items yet. Click "Add News" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statistics" className="mt-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
                <CardDescription>Overview of user growth and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded">
                  <div className="text-center">
                    <BarChart4 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">User statistics chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Financial metrics and revenue tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded">
                  <div className="text-center">
                    <BarChart4 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Revenue chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>SEO Performance</CardTitle>
                <CardDescription>Keyword rankings and search traffic analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Top Ranking Keywords</h3>
                    <div className="space-y-2">
                      {['Mpesa Calculator', 'Mpesa Contribution Totals', 'Mpesa for Chama', 'Mpesa total', 'Mpesa report'].map((keyword, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span>{keyword}</span>
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            {Math.floor(Math.random() * 50) + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm text-gray-500 mb-1">Search Impressions</h4>
                      <p className="text-2xl font-bold">2,412</p>
                      <span className="text-xs text-green-600">↑ 12% vs last month</span>
                    </div>
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm text-gray-500 mb-1">Search Clicks</h4>
                      <p className="text-2xl font-bold">342</p>
                      <span className="text-xs text-green-600">↑ 8% vs last month</span>
                    </div>
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm text-gray-500 mb-1">CTR</h4>
                      <p className="text-2xl font-bold">14.2%</p>
                      <span className="text-xs text-amber-600">↓ 3% vs last month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
