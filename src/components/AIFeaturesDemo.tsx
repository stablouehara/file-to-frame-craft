import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMediaRecommendations, useAdCopyGeneration, useInsights } from '@/hooks/useAIRecommendations';
import { useJobPostings } from '@/hooks/useJobPostings';
import { Loader2, Sparkles, FileText, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AIFeaturesDemo() {
  const { toast } = useToast();
  const { jobPostings } = useJobPostings();
  const { generateRecommendations, loading: recLoading } = useMediaRecommendations();
  const { generateAdCopy, loading: adLoading } = useAdCopyGeneration();
  const { generateInsights, loading: insightsLoading } = useInsights();

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [adCopies, setAdCopies] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);

  const handleGenerateRecommendations = async () => {
    if (jobPostings.length === 0) {
      toast({
        title: 'エラー',
        description: '求人が存在しません。先に求人を作成してください。',
        variant: 'destructive',
      });
      return;
    }

    try {
      const firstJob = jobPostings[0];
      const recs = await generateRecommendations(firstJob.id);
      setRecommendations(recs);

      toast({
        title: '成功',
        description: `${recs.length}件のメディア推薦を生成しました`,
      });
    } catch (error: any) {
      toast({
        title: 'エラー',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleGenerateAdCopy = async () => {
    if (jobPostings.length === 0) {
      toast({
        title: 'エラー',
        description: '求人が存在しません。先に求人を作成してください。',
        variant: 'destructive',
      });
      return;
    }

    try {
      const firstJob = jobPostings[0];
      const copies = await generateAdCopy(firstJob.id, 'Indeed', 3);
      setAdCopies(copies);

      toast({
        title: '成功',
        description: `${copies.length}件の広告コピーを生成しました`,
      });
    } catch (error: any) {
      toast({
        title: 'エラー',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleGenerateInsights = async () => {
    try {
      const result = await generateInsights();
      setInsights(result.insights);

      toast({
        title: '成功',
        description: `${result.insights.length}件のインサイトを生成しました`,
      });
    } catch (error: any) {
      toast({
        title: 'エラー',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI機能デモ</h1>
        <p className="text-muted-foreground">
          バックエンドAPIのAI機能をテストできます
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* メディア推薦 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              メディア推薦
            </CardTitle>
            <CardDescription>
              求人に最適な媒体を推薦
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGenerateRecommendations}
              disabled={recLoading || jobPostings.length === 0}
              className="w-full"
            >
              {recLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                '推薦を生成'
              )}
            </Button>

            {recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">生成結果:</p>
                {recommendations.map((rec, index) => (
                  <div key={index} className="text-sm p-2 bg-muted rounded">
                    <div className="font-medium">{rec.ranking}. {rec.media_name}</div>
                    <div className="text-xs text-muted-foreground">{rec.reason}</div>
                    <div className="text-xs mt-1">
                      CPA: ¥{rec.estimated_cpa?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 広告コピー生成 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              広告コピー生成
            </CardTitle>
            <CardDescription>
              媒体向けの広告文を生成
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGenerateAdCopy}
              disabled={adLoading || jobPostings.length === 0}
              className="w-full"
            >
              {adLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                'コピーを生成'
              )}
            </Button>

            {adCopies.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">生成結果:</p>
                {adCopies.map((copy, index) => (
                  <div key={index} className="text-sm p-2 bg-muted rounded">
                    <div className="font-medium">バージョン {copy.version}</div>
                    <div className="text-xs font-medium mt-1">{copy.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {copy.body}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* インサイト生成 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              インサイト生成
            </CardTitle>
            <CardDescription>
              データを分析して改善提案
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGenerateInsights}
              disabled={insightsLoading}
              className="w-full"
            >
              {insightsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  分析中...
                </>
              ) : (
                'インサイトを生成'
              )}
            </Button>

            {insights.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">分析結果:</p>
                {insights.slice(0, 3).map((insight, index) => (
                  <div
                    key={index}
                    className={`text-sm p-2 rounded ${
                      insight.type === 'success' ? 'bg-green-50 border border-green-200' :
                      insight.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className="font-medium">{insight.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {insight.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 注意事項 */}
      <Card>
        <CardHeader>
          <CardTitle>セットアップ手順</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>AI機能を使用するには、以下の手順が必要です：</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Anthropic APIキーを取得（https://console.anthropic.com/）</li>
            <li>.envファイルにANTHROPIC_API_KEYを設定</li>
            <li>Supabase CLIをインストール（npm install -g supabase）</li>
            <li>Edge Functionsをデプロイ（supabase functions deploy）</li>
            <li>Supabaseに環境変数を設定（supabase secrets set ANTHROPIC_API_KEY=...）</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-4">
            詳細はBACKEND_README.mdを参照してください
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
