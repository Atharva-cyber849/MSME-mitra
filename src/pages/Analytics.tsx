import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, MessageSquare, ThumbsUp, Users, Clock } from "lucide-react";
import { chatbotAPI } from "@/lib/api";

interface AnalyticsData {
  popular_queries: Array<{ intent: string; count: number; avg_confidence: number }>;
  daily_stats: Array<{
    date: string;
    total_queries: number;
    unique_sessions: number;
    avg_response_time: number;
    success_rate: number;
  }>;
  intent_distribution: Array<{ intent: string; count: number }>;
  satisfaction_metrics: {
    total_feedback: number;
    positive: number;
    negative: number;
    satisfaction_rate: number;
  };
  language_distribution: Array<{ language: string; count: number }>;
  session_stats: { active_sessions: number; total_messages: number };
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const result = await chatbotAPI.getAnalyticsDashboard();
      setData(result);
      setError(null);
    } catch (err) {
      setError("Failed to load analytics data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-4">{error || "No data available"}</p>
              <button
                onClick={fetchAnalytics}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const totalQueries = data.daily_stats.reduce((sum, day) => sum + day.total_queries, 0);
  const avgResponseTime =
    data.daily_stats.reduce((sum, day) => sum + day.avg_response_time, 0) / data.daily_stats.length;

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground mb-4">
            विश्लेषण डैशबोर्ड
            <br />
            <span className="text-4xl md:text-5xl">Analytics Dashboard</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            चैटबॉट प्रदर्शन, उपयोगकर्ता जुड़ाव और लोकप्रिय विषयों को ट्रैक करें
            <br />
            Track chatbot performance, user engagement, and popular topics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base md:text-lg font-semibold">Total Queries | कुल प्रश्न</CardTitle>
              <MessageSquare className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-primary">{totalQueries}</div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">Last 7 days | पिछले 7 दिन</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base md:text-lg font-semibold">Active Sessions | सक्रिय सत्र</CardTitle>
              <Users className="h-6 w-6 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-accent">{data.session_stats.active_sessions}</div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">Currently active | वर्तमान सक्रिय</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base md:text-lg font-semibold">Satisfaction | संतुष्टि दर</CardTitle>
              <ThumbsUp className="h-6 w-6 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-success">{data.satisfaction_metrics.satisfaction_rate}%</div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                {data.satisfaction_metrics.positive} positive / {data.satisfaction_metrics.total_feedback} total
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base md:text-lg font-semibold">Response Time | प्रतिक्रिया समय</CardTitle>
              <Clock className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-primary">{avgResponseTime.toFixed(2)}s</div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">Average per query | औसत प्रति प्रश्न</p>
            </CardContent>
          </Card>
        </div>

        {/* Popular Queries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <TrendingUp className="w-6 h-6" />
                लोकप्रिय विषय | Popular Topics
              </CardTitle>
              <CardDescription className="text-base">Most queried intents | सबसे अधिक पूछे गए विषय</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.popular_queries.slice(0, 5).map((query, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-base md:text-lg font-semibold truncate">{query.intent.replace("Questions about ", "")}</p>
                      <p className="text-sm md:text-base text-muted-foreground">
                        Confidence: {(query.avg_confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm md:text-base font-bold bg-primary/10 text-primary">
                        {query.count} queries
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <BarChart3 className="w-6 h-6" />
                भाषा वितरण | Language Distribution
              </CardTitle>
              <CardDescription className="text-base">User language preferences | उपयोगकर्ता भाषा वरीयताएँ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.language_distribution.map((lang, index) => {
                  const total = data.language_distribution.reduce((sum, l) => sum + l.count, 0);
                  const percentage = (lang.count / total) * 100;
                  return (
                    <div key={index} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base md:text-lg font-semibold capitalize">{lang.language}</span>
                        <span className="text-sm md:text-base text-muted-foreground font-medium">{lang.count} queries</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3">
                        <div
                          className="bg-accent h-3 rounded-full transition-all duration-300 shadow-sm"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">{percentage.toFixed(1)}%</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Statistics</CardTitle>
            <CardDescription>Query volume and performance over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.daily_stats.reverse().map((day, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium">{new Date(day.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Queries</p>
                    <p className="text-sm font-medium">{day.total_queries}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                    <p className="text-sm font-medium">{day.unique_sessions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Response Time</p>
                    <p className="text-sm font-medium">{day.avg_response_time.toFixed(2)}s</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                    <p className="text-sm font-medium">{day.success_rate.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
