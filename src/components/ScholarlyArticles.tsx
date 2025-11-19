import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Search, ExternalLink, BookOpen, FileText, Calendar, Users, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Article {
  title: string;
  authors: string[];
  year: string;
  source: string;
  abstract: string;
  url: string;
  citations?: number;
  relevance?: number;
}

interface ScholarlyArticlesProps {
  initialTopic?: string;
}

export function ScholarlyArticles({ initialTopic }: ScholarlyArticlesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-populate search with initial topic
  useEffect(() => {
    if (initialTopic) {
      setSearchQuery(initialTopic);
    }
  }, [initialTopic]);

  const searchArticles = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search topic");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // Simulate API call - In production, this would call Google Scholar API or similar
    // You could also integrate with Semantic Scholar, arXiv, or use OpenAI to suggest papers
    setTimeout(() => {
      const mockArticles: Article[] = [
        {
          title: "Deep Learning Approaches for Natural Language Processing: A Comprehensive Review",
          authors: ["Zhang, Y.", "Chen, M.", "Wang, L."],
          year: "2023",
          source: "Journal of Artificial Intelligence Research",
          abstract: "This comprehensive review examines the evolution and current state of deep learning methodologies in natural language processing. We analyze transformer architectures, attention mechanisms, and their applications in various NLP tasks including sentiment analysis, machine translation, and question answering. Our findings demonstrate significant improvements in model performance across multiple benchmarks.",
          url: "https://scholar.google.com/scholar?q=" + encodeURIComponent(searchQuery),
          citations: 342,
          relevance: 95
        },
        {
          title: "Attention Mechanisms in Neural Networks: Theory and Practice",
          authors: ["Kumar, A.", "Singh, R."],
          year: "2022",
          source: "IEEE Transactions on Neural Networks",
          abstract: "Attention mechanisms have revolutionized deep learning architectures. This paper provides a theoretical framework for understanding attention weights and their role in model interpretability. We present empirical evidence from multiple domains showing how attention improves model performance and provides insights into decision-making processes.",
          url: "https://scholar.google.com/scholar?q=" + encodeURIComponent(searchQuery),
          citations: 567,
          relevance: 92
        },
        {
          title: "Transfer Learning in Computer Vision: Current Trends and Future Directions",
          authors: ["Martinez, J.", "Thompson, K.", "Liu, X."],
          year: "2023",
          source: "Computer Vision and Pattern Recognition",
          abstract: "Transfer learning has become a cornerstone technique in computer vision applications. This study evaluates pre-trained models including ResNet, VGG, and Vision Transformers across various downstream tasks. We propose a novel fine-tuning strategy that reduces training time by 40% while maintaining accuracy.",
          url: "https://scholar.google.com/scholar?q=" + encodeURIComponent(searchQuery),
          citations: 234,
          relevance: 88
        },
        {
          title: "Reinforcement Learning for Autonomous Systems: Challenges and Opportunities",
          authors: ["Park, S.", "Davidson, M."],
          year: "2024",
          source: "Nature Machine Intelligence",
          abstract: "Autonomous systems powered by reinforcement learning are transforming robotics and control theory. This paper discusses key challenges including sample efficiency, safety constraints, and sim-to-real transfer. We present case studies from autonomous driving, drone navigation, and industrial automation.",
          url: "https://scholar.google.com/scholar?q=" + encodeURIComponent(searchQuery),
          citations: 89,
          relevance: 85
        },
        {
          title: "Ethical Considerations in AI Development: A Framework for Responsible Innovation",
          authors: ["Anderson, P.", "Brown, E.", "Taylor, R.", "Wilson, J."],
          year: "2023",
          source: "AI Ethics and Society",
          abstract: "As artificial intelligence systems become increasingly integrated into society, ethical considerations must guide development. This paper proposes a comprehensive framework addressing bias, fairness, transparency, and accountability. We provide practical guidelines for implementing ethical AI practices in research and industry.",
          url: "https://scholar.google.com/scholar?q=" + encodeURIComponent(searchQuery),
          citations: 421,
          relevance: 82
        },
        {
          title: "Graph Neural Networks: Applications in Social Network Analysis",
          authors: ["Chen, H.", "Rodriguez, M."],
          year: "2022",
          source: "ACM Computing Surveys",
          abstract: "Graph neural networks extend deep learning to graph-structured data. This survey explores their application in social network analysis, including community detection, influence prediction, and link prediction. We benchmark popular architectures and identify promising research directions.",
          url: "https://scholar.google.com/scholar?q=" + encodeURIComponent(searchQuery),
          citations: 198,
          relevance: 79
        }
      ];

      setArticles(mockArticles);
      setIsSearching(false);
      toast.success(`Found ${mockArticles.length} scholarly articles`);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchArticles();
    }
  };

  const openGoogleScholar = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search topic first");
      return;
    }
    const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(searchQuery)}`;
    window.open(url, "_blank");
  };

  const openSemanticScholar = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search topic first");
      return;
    }
    const url = `https://www.semanticscholar.org/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-[#7EC4B6]" />
            <h1 className="text-3xl text-white">Scholarly Articles</h1>
          </div>
          <p className="text-[#A8DCD1]/80">
            Find relevant research papers and academic resources for your study topic
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-6 bg-[#2C4A52] border-[#7EC4B6]/20 mb-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8DCD1]/60" />
                <Input
                  placeholder="Enter your study topic (e.g., 'machine learning algorithms', 'photosynthesis', 'world war 2')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 bg-[#1f3740] border-[#7EC4B6]/30 text-white placeholder:text-zinc-500"
                />
              </div>
              <Button
                onClick={searchArticles}
                disabled={isSearching}
                className="bg-[#7EC4B6] hover:bg-[#6BB3A5] text-[#1f3740]"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#A8DCD1]/60 text-sm">Quick search on:</span>
              <Button
                onClick={openGoogleScholar}
                variant="outline"
                size="sm"
                className="border-[#7EC4B6]/30 text-[#7EC4B6] hover:bg-[#7EC4B6]/10"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Google Scholar
              </Button>
              <Button
                onClick={openSemanticScholar}
                variant="outline"
                size="sm"
                className="border-[#7EC4B6]/30 text-[#7EC4B6] hover:bg-[#7EC4B6]/10"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Semantic Scholar
              </Button>
            </div>
          </div>
        </Card>

        {/* AI Suggestions */}
        {!hasSearched && initialTopic && (
          <Card className="p-6 bg-[#7EC4B6]/10 border-[#7EC4B6]/20 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#7EC4B6] mt-1" />
              <div>
                <h3 className="text-white mb-2">✨ Auto-loaded from your study session</h3>
                <p className="text-[#A8DCD1]/80 text-sm mb-2">
                  We've pre-filled the search with your study topic: <span className="text-[#7EC4B6] font-medium">"{initialTopic}"</span>
                </p>
                <p className="text-[#A8DCD1]/60 text-sm">
                  Click "Search" to find relevant scholarly articles, or edit the topic above.
                </p>
              </div>
            </div>
          </Card>
        )}
        
        {!hasSearched && !initialTopic && (
          <Card className="p-6 bg-[#7EC4B6]/10 border-[#7EC4B6]/20 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#7EC4B6] mt-1" />
              <div>
                <h3 className="text-white mb-2">💡 Search Tips</h3>
                <ul className="text-[#A8DCD1]/80 text-sm space-y-1">
                  <li>• Use specific keywords related to your study topic</li>
                  <li>• Include key concepts or theories you're learning about</li>
                  <li>• Try different search terms if you don't find what you need</li>
                  <li>• Look for review papers for comprehensive overviews</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4">
            {isSearching ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-[#7EC4B6] animate-spin mx-auto mb-4" />
                  <p className="text-[#A8DCD1]">Searching scholarly databases...</p>
                </div>
              </div>
            ) : articles.length === 0 ? (
              <Card className="p-12 bg-[#2C4A52] border-[#7EC4B6]/20 text-center">
                <FileText className="w-16 h-16 text-[#A8DCD1]/40 mx-auto mb-4" />
                <h3 className="text-white mb-2">No articles found</h3>
                <p className="text-[#A8DCD1]/60 mb-4">Try a different search query or use the quick search links above</p>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[#A8DCD1]">
                    Found <span className="text-[#7EC4B6] font-medium">{articles.length}</span> articles
                  </p>
                  <div className="text-sm text-[#A8DCD1]/60">
                    Sorted by relevance
                  </div>
                </div>

                {articles.map((article, index) => (
                  <Card key={index} className="p-6 bg-[#2C4A52] border-[#7EC4B6]/20 hover:border-[#7EC4B6]/40 transition-all">
                    <div className="space-y-3">
                      {/* Title and Relevance */}
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-white text-lg flex-1 hover:text-[#7EC4B6] cursor-pointer transition-colors">
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            {article.title}
                          </a>
                        </h3>
                        {article.relevance && (
                          <div className="bg-[#7EC4B6]/20 text-[#7EC4B6] px-3 py-1 rounded-full text-sm whitespace-nowrap">
                            {article.relevance}% match
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 flex-wrap text-sm text-[#A8DCD1]/60">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {article.authors.join(", ")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {article.year}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {article.source}
                        </div>
                        {article.citations !== undefined && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {article.citations} citations
                          </div>
                        )}
                      </div>

                      {/* Abstract */}
                      <p className="text-[#A8DCD1]/80 text-sm leading-relaxed">
                        {article.abstract}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          onClick={() => window.open(article.url, "_blank")}
                          variant="outline"
                          size="sm"
                          className="border-[#7EC4B6]/30 text-[#7EC4B6] hover:bg-[#7EC4B6]/10"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Article
                        </Button>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(article.title + " - " + article.authors.join(", ") + " (" + article.year + ")");
                            toast.success("Citation copied to clipboard");
                          }}
                          variant="outline"
                          size="sm"
                          className="border-[#7EC4B6]/30 text-[#7EC4B6] hover:bg-[#7EC4B6]/10"
                        >
                          Copy Citation
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}