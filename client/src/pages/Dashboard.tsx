import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { HeaderSection } from "./sections/HeaderSection";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Download, RefreshCw, Zap, Clock, AlignLeft, Search, Eye, RotateCcw, Trash2, Star, Lightbulb, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type ThreadLength = "short" | "medium" | "long";

interface Thread {
  id: number;
  topic: string;
  content: string;
  length: ThreadLength;
  wordCount: number;
  tweetCount: number;
  isFavorite: boolean;
  copyCount: number;
  createdAt: string;
}

export default function Dashboard(): JSX.Element {
  const [topic, setTopic] = useState("");
  const [selectedLength, setSelectedLength] = useState<ThreadLength>("medium");
  const [generatedThread, setGeneratedThread] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentThreads, setRecentThreads] = useState<Thread[]>([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [viewingThread, setViewingThread] = useState<Thread | null>(null);

  const lengthOptions = {
    short: {
      name: "Quick Hit",
      description: "150-300 words • 3-5 tweets",
      subtitle: "Perfect for tips & insights",
      icon: <Zap className="w-4 h-4" />,
      color: "bg-green-50 border-green-200 text-green-700",
      activeColor: "border-green-500 bg-green-50"
    },
    medium: {
      name: "Deep Dive", 
      description: "350-500 words • 6-8 tweets",
      subtitle: "Ideal for how-tos & stories",
      icon: <Clock className="w-4 h-4" />,
      color: "bg-blue-50 border-blue-200 text-blue-700",
      activeColor: "border-blue-500 bg-blue-50"
    },
    long: {
      name: "Masterclass",
      description: "550-750 words • 9-12 tweets", 
      subtitle: "Comprehensive guides & analysis",
      icon: <AlignLeft className="w-4 h-4" />,
      color: "bg-purple-50 border-purple-200 text-purple-700",
      activeColor: "border-purple-500 bg-purple-50"
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic first!");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Get auth token for API call
      const { getSupabaseClient } = await import("@/lib/supabase");
      const supabase = await getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      // Call the thread generation API
      const response = await fetch('/api/generate-thread', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          length: selectedLength
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate thread');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setGeneratedThread(result.data.thread);
        // Refresh recent threads to show the newly generated thread
        fetchRecentThreads();
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('Error generating thread:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to generate thread: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedThread);
    // TODO: Add toast notification
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedThread], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `viral-thread-${topic.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Helper function to get authentication token
  const getAuthToken = async () => {
    const { getSupabaseClient } = await import("@/lib/supabase");
    const supabase = await getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }
    
    return session.access_token;
  };

  // Fetch recent threads from API
  const fetchRecentThreads = async () => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch('/api/recent-threads?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch threads');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Format the date for display
        const formattedThreads = result.data.map((thread: any) => ({
          ...thread,
          createdAt: formatRelativeTime(new Date(thread.createdAt))
        }));
        setRecentThreads(formattedThreads);
      }
    } catch (error) {
      console.error('Error fetching recent threads:', error);
    } finally {
      setIsLoadingThreads(false);
    }
  };

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Load recent threads on component mount
  useEffect(() => {
    fetchRecentThreads();
  }, []);

  const filteredThreads = recentThreads.filter(thread =>
    thread.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyRecentThread = async (content: string, threadId: number) => {
    try {
      // Copy to clipboard
      navigator.clipboard.writeText(content);
      
      // Update copy count via API
      const token = await getAuthToken();
      
      const response = await fetch(`/api/threads/${threadId}/copy`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh threads to show updated copy count
        fetchRecentThreads();
      }
    } catch (error) {
      console.error('Error updating copy count:', error);
      // Still copy to clipboard even if API fails
      navigator.clipboard.writeText(content);
    }
  };

  const handleToggleFavorite = async (threadId: number, currentFavoriteStatus: boolean) => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`/api/threads/${threadId}/favorite`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFavorite: !currentFavoriteStatus
        }),
      });

      if (response.ok) {
        // Optimistically update the local state
        setRecentThreads(prevThreads =>
          prevThreads.map(thread =>
            thread.id === threadId
              ? { ...thread, isFavorite: !currentFavoriteStatus }
              : thread
          )
        );
      } else {
        throw new Error('Failed to update favorite status');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  const handleDeleteThread = async (threadId: number) => {
    if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await getAuthToken();
      
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove from local state
        setRecentThreads(prevThreads =>
          prevThreads.filter(thread => thread.id !== threadId)
        );
      } else {
        throw new Error('Failed to delete thread');
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('Failed to delete thread. Please try again.');
    }
  };

  const handleRegenerateThread = (threadTopic: string, threadLength: ThreadLength) => {
    setTopic(threadTopic);
    setSelectedLength(threadLength);
    // Scroll to top to show the generation form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getLengthBadgeColor = (length: ThreadLength) => {
    switch (length) {
      case 'short': return 'bg-green-100 text-green-700 border-green-300';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'long': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Quick topic suggestions
  const quickTopics = [
    "5 productivity hacks that changed my life",
    "Why most people fail at building habits",
    "AI tools every entrepreneur should know",
    "Building a personal brand in 2024",
    "Social media strategies that actually work",
    "Remote work mistakes everyone makes"
  ];

  const handleQuickTopic = (quickTopic: string) => {
    setTopic(quickTopic);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <HeaderSection />
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-gradient">Viral Thread</span> Generator
            </h1>
            <p className="text-muted-foreground text-lg">
              Create engaging Twitter threads that go viral with AI-powered content
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Generation Panel */}
            <Card className="bg-card/80 backdrop-blur border border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Thread Generator
                </CardTitle>
                <CardDescription>
                  Enter your topic and choose the thread length to generate viral content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Topic Input */}
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-base font-medium">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Benefits of morning exercise, Tips for remote work, AI trends in 2024..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="text-base p-3"
                    data-testid="input-topic"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific and clear about what you want to discuss
                  </p>
                </div>

                {/* Quick Topics */}
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Quick Topics
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickTopics.map((quickTopic, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickTopic(quickTopic)}
                        className="p-2 text-left border border-border rounded-md hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 text-xs"
                        data-testid={`quick-topic-${index}`}
                      >
                        {quickTopic}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click any topic above to use it as your starting point
                  </p>
                </div>

                {/* Length Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Thread Length</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(lengthOptions).map(([key, option]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedLength(key as ThreadLength)}
                        className={`p-4 border-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                          selectedLength === key
                            ? option.activeColor
                            : `border-border hover:border-primary/50 ${option.color}`
                        }`}
                        data-testid={`length-${key}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {option.icon}
                          <span className="font-semibold">{option.name}</span>
                        </div>
                        <p className="text-sm font-medium">{option.description}</p>
                        <p className="text-xs text-gray-600 mt-1">{option.subtitle}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full gradient-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-105 text-lg py-3 disabled:opacity-50 disabled:hover:scale-100"
                  data-testid="button-generate"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Viral Thread
                    </>
                  )}
                </Button>

              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="bg-card/80 backdrop-blur border border-border/50 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Generated Thread
                      {generatedThread && (
                        <Badge className="gradient-secondary text-white">
                          {lengthOptions[selectedLength].name}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Your AI-generated viral thread appears here
                    </CardDescription>
                  </div>
                  {generatedThread && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        data-testid="button-copy"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        data-testid="button-download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedThread ? (
                  <div className="space-y-4">
                    <Textarea
                      value={generatedThread}
                      readOnly
                      className="min-h-[400px] text-base leading-relaxed"
                      data-testid="generated-thread"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Characters: {generatedThread.length}</span>
                      <span>Estimated engagement: High 🔥</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <Sparkles className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Ready to Create</h3>
                    <p className="text-muted-foreground">
                      Enter your topic and click generate to create your viral thread
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Threads */}
          <Card className="mt-8 bg-card/80 backdrop-blur border border-border/50 shadow-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Recent Threads</CardTitle>
                  <CardDescription>Your previously generated viral threads</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search threads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                      data-testid="search-threads"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredThreads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? `No threads found for "${searchQuery}"` : "No threads generated yet"}
                  </div>
                ) : (
                  filteredThreads.map((thread) => (
                    <div key={thread.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-base">{thread.topic}</h4>
                            {thread.isFavorite && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`text-xs ${getLengthBadgeColor(thread.length)}`}>
                              {lengthOptions[thread.length].name}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {thread.wordCount} words
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {thread.createdAt}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {thread.content.substring(0, 120)}...
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Copied {thread.copyCount} times
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyRecentThread(thread.content, thread.id)}
                            data-testid={`copy-thread-${thread.id}`}
                          >
                            <Copy className="w-4 h-4" />
                            <span className="hidden sm:inline ml-1">Copy</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingThread(thread)}
                            data-testid={`view-thread-${thread.id}`}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline ml-1">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegenerateThread(thread.topic, thread.length)}
                            data-testid={`regenerate-thread-${thread.id}`}
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span className="hidden sm:inline ml-1">Regenerate</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteThread(thread.id)}
                            data-testid={`delete-thread-${thread.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Thread View Modal */}
      {viewingThread && (
        <Dialog open={!!viewingThread} onOpenChange={() => setViewingThread(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewingThread.topic}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 text-sm">
                <Badge className={`${getLengthBadgeColor(viewingThread.length)}`}>
                  {lengthOptions[viewingThread.length].name}
                </Badge>
                <span>{viewingThread.wordCount} words</span>
                <span>{viewingThread.tweetCount} tweets</span>
                <span>{viewingThread.createdAt}</span>
                <span>Copied {viewingThread.copyCount} times</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-6">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                  {viewingThread.content}
                </pre>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleCopyRecentThread(viewingThread.content, viewingThread.id)}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Thread
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const element = document.createElement("a");
                    const file = new Blob([viewingThread.content], { type: 'text/plain' });
                    element.href = URL.createObjectURL(file);
                    element.download = `viral-thread-${viewingThread.topic.replace(/\s+/g, '-').toLowerCase()}.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleRegenerateThread(viewingThread.topic, viewingThread.length);
                    setViewingThread(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleToggleFavorite(viewingThread.id, viewingThread.isFavorite)}
                  className="flex items-center gap-2"
                >
                  <Star className={`w-4 h-4 ${viewingThread.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                  {viewingThread.isFavorite ? 'Unfavorite' : 'Favorite'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}