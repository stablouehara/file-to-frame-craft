import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  AlertCircle,
  Briefcase,
  Users,
  Target,
  Award,
  DollarSign,
  Download,
  RefreshCw,
  Info,
  Brain,
  Zap,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RecruitmentDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // グラフ用データ
  const applicationTrendData = [
    { date: '10/12', Indeed: 4, Wantedly: 2, ビズリーチ: 1, doda: 3 },
    { date: '10/13', Indeed: 3, Wantedly: 5, ビズリーチ: 2, doda: 2 },
    { date: '10/14', Indeed: 7, Wantedly: 3, ビズリーチ: 3, doda: 4 },
    { date: '10/15', Indeed: 5, Wantedly: 8, ビズリーチ: 2, doda: 3 },
    { date: '10/16', Indeed: 9, Wantedly: 6, ビズリーチ: 4, doda: 5 },
    { date: '10/17', Indeed: 6, Wantedly: 10, ビズリーチ: 3, doda: 4 },
    { date: '10/18', Indeed: 8, Wantedly: 7, ビズリーチ: 5, doda: 6 },
  ];

  const mediaPerformanceData = [
    { name: 'Indeed', 応募数: 45, 採用数: 3, 費用: 8 },
    { name: 'Wantedly', 応募数: 38, 採用数: 2, 費用: 5 },
    { name: 'ビズリーチ', 応募数: 22, 採用数: 2, 費用: 12 },
    { name: 'doda', 応募数: 28, 採用数: 1, 費用: 10 },
    { name: 'Green', 応募数: 15, 採用数: 1, 費用: 4 },
  ];

  const jobTypeDistribution = [
    { name: 'エンジニア', value: 40, color: '#3B82F6' },
    { name: '営業', value: 25, color: '#10B981' },
    { name: 'マーケティング', value: 20, color: '#F59E0B' },
    { name: '事務', value: 10, color: '#8B5CF6' },
    { name: 'その他', value: 5, color: '#6B7280' },
  ];

  const aiInsights = [
    {
      type: 'success',
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Wantedlyの効果が向上中',
      description:
        'エンジニア求人でWantedlyからの応募が先週比40%増加しています。',
      action: '詳細を見る',
    },
    {
      type: 'warning',
      icon: <AlertCircle className="w-5 h-5" />,
      title: '営業職の応募が低調',
      description:
        '営業マネージャー求人の応募率が業界平均を下回っています。広告文の見直しを推奨します。',
      action: '改善提案を見る',
    },
    {
      type: 'info',
      icon: <Brain className="w-5 h-5" />,
      title: '新しい媒体の提案',
      description:
        '過去の成功パターンから、データアナリスト採用にはtype転職がおすすめです。',
      action: '媒体を追加',
    },
  ];

  const recommendedActions = [
    {
      priority: 'high',
      title: '効果測定の入力',
      description: '3件の求人で効果測定が未入力です',
      count: 3,
    },
    {
      priority: 'medium',
      title: '広告文の最適化',
      description: '2件の求人でAIが改善提案をしています',
      count: 2,
    },
    {
      priority: 'low',
      title: 'ナレッジの更新',
      description: '新しい成功事例を登録できます',
      count: 1,
    },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">
                スマート求人ダッシュボード
              </h1>
              <span className="px-3 py-1 text-sm bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-full font-medium shadow-glow">
                AI Powered
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">過去7日間</SelectItem>
                  <SelectItem value="month">過去30日間</SelectItem>
                  <SelectItem value="quarter">過去3ヶ月</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                className={refreshing ? 'animate-spin' : ''}
              >
                <RefreshCw className="w-5 h-5" />
              </Button>

              <Button variant="outline" size="icon">
                <Download className="w-5 h-5" />
              </Button>

              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-md">
                <Zap className="w-5 h-5 mr-2" />
                <span>AIで求人作成</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* AI インサイト */}
        {showAIInsights && (
          <Card className="bg-gradient-to-br from-info-light via-background to-accent/10 border-accent/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="w-6 h-6 text-accent" />
                  <CardTitle>AIからの提案</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAIInsights(false)}
                  className="h-8 w-8"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiInsights.map((insight, index) => (
                  <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            insight.type === 'success'
                              ? 'bg-success-light text-success'
                              : insight.type === 'warning'
                              ? 'bg-warning-light text-warning'
                              : 'bg-info-light text-info'
                          }`}
                        >
                          {insight.icon}
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold text-card-foreground text-sm">
                            {insight.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {insight.description}
                          </p>
                          <Button variant="link" className="h-auto p-0 text-xs text-primary">
                            {insight.action} →
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* メトリクスカード */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="w-8 h-8 text-primary" />
                <span className="text-xs bg-success-light text-success px-2 py-1 rounded-md font-medium">
                  +20%
                </span>
              </div>
              <div className="text-3xl font-bold text-foreground">12</div>
              <div className="text-sm text-muted-foreground mt-1">掲載中</div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-success" />
                <span className="text-xs bg-success-light text-success px-2 py-1 rounded-md font-medium">
                  +35%
                </span>
              </div>
              <div className="text-3xl font-bold text-foreground">148</div>
              <div className="text-sm text-muted-foreground mt-1">総応募数</div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-accent" />
                <span className="text-xs bg-info-light text-info px-2 py-1 rounded-md font-medium">
                  良好
                </span>
              </div>
              <div className="text-3xl font-bold text-foreground">15.2%</div>
              <div className="text-sm text-muted-foreground mt-1">平均応募率</div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-warning" />
                <span className="text-xs bg-warning-light text-warning px-2 py-1 rounded-md font-medium">
                  +2
                </span>
              </div>
              <div className="text-3xl font-bold text-foreground">9</div>
              <div className="text-sm text-muted-foreground mt-1">採用決定</div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-warning" />
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold text-foreground">4.8万</div>
              <div className="text-sm text-muted-foreground mt-1">平均CPA</div>
            </CardContent>
          </Card>
        </div>

        {/* グラフエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 応募トレンド */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>応募トレンド</CardTitle>
                <div className="flex items-center space-x-2 text-sm">
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    日次
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button className="text-primary font-medium">週次</button>
                  <span className="text-muted-foreground">|</span>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    月次
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={applicationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Indeed"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Wantedly"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ビズリーチ"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="doda"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 媒体別パフォーマンス */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>媒体別効果</CardTitle>
                <Select defaultValue="応募数">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="応募数">応募数</SelectItem>
                    <SelectItem value="採用数">採用数</SelectItem>
                    <SelectItem value="コスト効率">コスト効率</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mediaPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="応募数" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="採用数" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 下部セクション */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 職種別分布 */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>職種別分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={jobTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {jobTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {jobTypeDistribution.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 推奨アクション */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>推奨アクション</CardTitle>
                <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-md font-medium">
                  6 件
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedActions.map((action, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            action.priority === 'high'
                              ? 'bg-destructive'
                              : action.priority === 'medium'
                              ? 'bg-warning'
                              : 'bg-success'
                          }`}
                        />
                        <h3 className="font-semibold text-foreground text-sm">
                          {action.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium">
                        {action.count}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="link" className="w-full text-sm text-primary">
                すべてのタスクを見る →
              </Button>
            </CardContent>
          </Card>

          {/* ナレッジベース */}
          <Card className="shadow-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary-foreground">ナレッジベース</CardTitle>
                <BookOpen className="w-6 h-6 opacity-80" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-medium">成功事例</span>
                  <span className="text-xs bg-white/30 px-2 py-1 rounded-md">
                    234件
                  </span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-medium">テンプレート</span>
                  <span className="text-xs bg-white/30 px-2 py-1 rounded-md">
                    45件
                  </span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-medium">媒体分析</span>
                  <span className="text-xs bg-white/30 px-2 py-1 rounded-md">
                    12件
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                className="w-full mt-2 bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
              >
                ナレッジを追加 +
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
