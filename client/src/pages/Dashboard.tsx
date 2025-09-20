import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { HeaderSection } from "./sections/HeaderSection";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Download, RefreshCw, Zap, Clock, AlignLeft, Search, Eye, RotateCcw, Trash2, Star, Lightbulb } from "lucide-react";

type ThreadLength = "short" | "medium" | "long";

export default function Dashboard(): JSX.Element {
  const [topic, setTopic] = useState("");
  const [selectedLength, setSelectedLength] = useState<ThreadLength>("medium");
  const [generatedThread, setGeneratedThread] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const lengthOptions = {
    short: {
      name: "Short",
      description: "200-400 words",
      icon: <Zap className="w-4 h-4" />,
      color: "bg-green-50 border-green-200 text-green-700",
      activeColor: "border-green-500 bg-green-50"
    },
    medium: {
      name: "Medium", 
      description: "500-800 words",
      icon: <Clock className="w-4 h-4" />,
      color: "bg-blue-50 border-blue-200 text-blue-700",
      activeColor: "border-blue-500 bg-blue-50"
    },
    long: {
      name: "Long",
      description: "900-1500 words", 
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

  // Sample recent threads data (replace with real data later)
  const recentThreads = [
    {
      id: 1,
      topic: "Benefits of morning exercise for productivity",
      content: "🧵 THREAD: Why morning exercise is a game-changer for your productivity...\n\n1/ Starting your day with exercise releases endorphins that boost your mood and energy levels for the entire day.\n\n2/ Studies show that people who exercise in the morning are 23% more productive at work and make better decisions.\n\n3/ Your brain gets increased blood flow and oxygen, leading to improved focus and cognitive function throughout the day.",
      length: "medium" as ThreadLength,
      wordCount: 587,
      createdAt: "2 hours ago",
      isFavorite: true,
      copyCount: 12
    },
    {
      id: 2,
      topic: "AI trends that will shape 2024",
      content: "🧵 THREAD: The AI trends that will completely reshape how we work in 2024...\n\n1/ AI agents are becoming mainstream - no longer just chatbots, but actual digital workers that can complete complex tasks.\n\n2/ Multimodal AI is exploding - combine text, images, video, and audio for unprecedented creativity and problem-solving.",
      length: "long" as ThreadLength,
      wordCount: 1247,
      createdAt: "1 day ago",
      isFavorite: false,
      copyCount: 8
    },
    {
      id: 3,
      topic: "Remote work productivity hacks",
      content: "🧵 THREAD: 5 remote work productivity hacks that changed my life...\n\n1/ Create a dedicated workspace - even if it's just a corner of your bedroom, make it sacred for work only.",
      length: "short" as ThreadLength,
      wordCount: 324,
      createdAt: "3 days ago",
      isFavorite: false,
      copyCount: 5
    }
  ];

  const filteredThreads = recentThreads.filter(thread =>
    thread.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyRecentThread = (content: string) => {
    navigator.clipboard.writeText(content);
    // TODO: Add toast notification
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
                        <p className="text-sm">{option.description}</p>
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
                              {thread.length.charAt(0).toUpperCase() + thread.length.slice(1)}
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
                            onClick={() => handleCopyRecentThread(thread.content)}
                            data-testid={`copy-thread-${thread.id}`}
                          >
                            <Copy className="w-4 h-4" />
                            <span className="hidden sm:inline ml-1">Copy</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* TODO: Show full thread modal */}}
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
                            onClick={() => {/* TODO: Delete thread */}}
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
    </div>
  );
}