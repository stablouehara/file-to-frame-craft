import { corsHeaders } from '../_shared/cors.ts';
import { callClaude } from '../_shared/anthropic.ts';
import { createSupabaseClient } from '../_shared/supabase.ts';

interface Insight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
  priority: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    // Create Supabase client
    const supabase = createSupabaseClient(req);

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all job postings for the user
    const { data: jobPostings } = await supabase
      .from('job_postings')
      .select('id, title, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch performance data
    const { data: performanceData } = await supabase
      .from('performance_data')
      .select('*')
      .in('job_posting_id', jobPostings?.map(jp => jp.id) || [])
      .order('date', { ascending: false })
      .limit(100);

    // Fetch media recommendations
    const { data: recommendations } = await supabase
      .from('media_recommendations')
      .select('*')
      .in('job_posting_id', jobPostings?.map(jp => jp.id) || [])
      .limit(50);

    // Calculate summary statistics
    const stats = {
      total_job_postings: jobPostings?.length || 0,
      active_job_postings: jobPostings?.filter(jp => jp.status === 'active').length || 0,
      total_applications: performanceData?.reduce((sum, p) => sum + (p.applications || 0), 0) || 0,
      total_hires: performanceData?.reduce((sum, p) => sum + (p.hires || 0), 0) || 0,
      total_cost: performanceData?.reduce((sum, p) => sum + (p.cost || 0), 0) || 0,
      total_impressions: performanceData?.reduce((sum, p) => sum + (p.impressions || 0), 0) || 0,
    };

    stats['avg_cpa'] = stats.total_applications > 0
      ? Math.round(stats.total_cost / stats.total_applications)
      : 0;

    stats['conversion_rate'] = stats.total_applications > 0
      ? ((stats.total_hires / stats.total_applications) * 100).toFixed(1)
      : '0.0';

    // Group performance by media
    const mediaPerformance: Record<string, any> = {};
    performanceData?.forEach(p => {
      if (!mediaPerformance[p.media_name]) {
        mediaPerformance[p.media_name] = {
          applications: 0,
          cost: 0,
          hires: 0,
          impressions: 0,
        };
      }
      mediaPerformance[p.media_name].applications += p.applications || 0;
      mediaPerformance[p.media_name].cost += p.cost || 0;
      mediaPerformance[p.media_name].hires += p.hires || 0;
      mediaPerformance[p.media_name].impressions += p.impressions || 0;
    });

    // Calculate CPA for each media
    Object.keys(mediaPerformance).forEach(media => {
      const perf = mediaPerformance[media];
      perf.cpa = perf.applications > 0 ? Math.round(perf.cost / perf.applications) : 0;
      perf.ctr = perf.impressions > 0
        ? ((perf.applications / perf.impressions) * 100).toFixed(2)
        : '0.00';
    });

    // Build the prompt for Claude
    const systemPrompt = `あなたは日本の採用市場に精通したHRアナリストです。採用データを分析し、実用的なインサイトと改善提案を提供してください。

インサイトは以下の3つのタイプに分類してください:
- success: ポジティブな傾向や成功事例
- warning: 注意が必要な問題や低パフォーマンス
- info: 中立的な情報やトレンド

以下のJSON形式で3〜6個のインサイトを提供してください:
{
  "insights": [
    {
      "type": "success" | "warning" | "info",
      "title": "インサイトのタイトル（30文字以内）",
      "description": "詳細説明（100文字以内）",
      "action": "推奨アクション（任意、50文字以内）",
      "priority": 1-10の優先度
    }
  ]
}`;

    const userPrompt = `以下の採用データを分析してインサイトを提供してください:

【全体統計】
- 求人数: ${stats.total_job_postings}件（アクティブ: ${stats.active_job_postings}件）
- 総応募数: ${stats.total_applications}件
- 総採用数: ${stats.total_hires}件
- 総コスト: ¥${stats.total_cost.toLocaleString()}
- 平均CPA: ¥${stats.avg_cpa.toLocaleString()}
- 採用転換率: ${stats.conversion_rate}%

【メディア別パフォーマンス】
${Object.entries(mediaPerformance).map(([media, perf]: [string, any]) =>
  `${media}: 応募${perf.applications}件、CPA ¥${perf.cpa.toLocaleString()}、CTR ${perf.ctr}%、採用${perf.hires}件`
).join('\n')}

【最近の求人】
${jobPostings?.slice(0, 5).map(jp => `- ${jp.title} (${jp.status})`).join('\n') || 'なし'}

【AI推薦データ】
${recommendations?.length || 0}件のメディア推薦を実施済み

データを分析し、実用的なインサイトをJSON形式で提供してください。具体的な数値や比較を含めてください。`;

    // Call Claude API
    const responseText = await callClaude(
      anthropicApiKey,
      [{ role: 'user', content: userPrompt }],
      systemPrompt,
      2048
    );

    // Parse the response
    let insights: Insight[];
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const parsed = JSON.parse(jsonMatch[0]);
      insights = parsed.insights;
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      throw new Error('Failed to parse AI response');
    }

    // Sort by priority
    insights.sort((a, b) => b.priority - a.priority);

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        stats,
        media_performance: mediaPerformance,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-insights:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
