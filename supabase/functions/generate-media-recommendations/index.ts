import { corsHeaders } from '../_shared/cors.ts';
import { callClaude } from '../_shared/anthropic.ts';
import { createSupabaseClient } from '../_shared/supabase.ts';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  employment_type: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  industry?: string;
}

interface MediaRecommendation {
  media_name: string;
  ranking: number;
  reason: string;
  estimated_reach: number;
  estimated_cost: number;
  estimated_applications: number;
  estimated_cpa: number;
}

const MEDIA_PLATFORMS = [
  { name: 'Indeed', description: '日本最大級の求人検索サイト。幅広い職種・業界をカバー' },
  { name: 'Wantedly', description: 'ベンチャー・スタートアップ向け。カジュアル面談重視' },
  { name: 'ビズリーチ', description: 'ハイクラス・エグゼクティブ向け。年収600万円以上' },
  { name: 'doda', description: '大手企業が多い。転職エージェントとの連携が強い' },
  { name: 'リクナビNEXT', description: '幅広い層をカバー。新卒採用にも強い' },
  { name: 'Green', description: 'IT・Web業界特化。エンジニア採用に強い' },
  { name: 'エン転職', description: '詳細な企業情報と口コミが特徴' },
  { name: 'マイナビ転職', description: '20代〜30代前半の若手層に強い' },
];

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

    // Parse request body
    const { job_posting_id } = await req.json();

    if (!job_posting_id) {
      return new Response(
        JSON.stringify({ error: 'job_posting_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createSupabaseClient(req);

    // Fetch job posting details
    const { data: jobPosting, error: fetchError } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', job_posting_id)
      .single();

    if (fetchError || !jobPosting) {
      return new Response(
        JSON.stringify({ error: 'Job posting not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch historical performance data for similar job postings
    const { data: performanceData } = await supabase
      .from('performance_data')
      .select('media_name, applications, cost, hires')
      .limit(20);

    // Build the prompt for Claude
    const systemPrompt = `あなたは日本の採用市場に精通したHRテックの専門家です。求人情報を分析し、最適な求人媒体（メディア）を推薦してください。

利用可能なメディア:
${MEDIA_PLATFORMS.map(m => `- ${m.name}: ${m.description}`).join('\n')}

以下の基準で評価してください:
1. 求人の職種・業界とメディアの特性の適合性
2. ターゲット層（年齢、経験、年収レベル）とメディアユーザー層の一致
3. 予想されるリーチ数（閲覧数）
4. 予想される応募数
5. 予想されるコスト（円）
6. 予想されるCPA（Cost Per Application）

必ず以下のJSON形式で3〜5個のメディアを推薦してください:
{
  "recommendations": [
    {
      "media_name": "メディア名",
      "ranking": 1,
      "reason": "推薦理由（100文字以内）",
      "estimated_reach": 推定リーチ数（数値）,
      "estimated_applications": 推定応募数（数値）,
      "estimated_cost": 推定コスト（円、数値）,
      "estimated_cpa": 推定CPA（円、数値）
    }
  ]
}`;

    const userPrompt = `以下の求人に最適なメディアを推薦してください:

【求人タイトル】
${jobPosting.title}

【職種・業界】
${jobPosting.industry || '未指定'}

【雇用形態】
${jobPosting.employment_type}

【勤務地】
${jobPosting.location}

【給与】
${jobPosting.salary_min ? `${jobPosting.salary_min.toLocaleString()}円` : '未指定'}${jobPosting.salary_max ? ` 〜 ${jobPosting.salary_max.toLocaleString()}円` : ''}

【仕事内容】
${jobPosting.description}

【必須要件】
${jobPosting.requirements}

【福利厚生・待遇】
${jobPosting.benefits}

${performanceData && performanceData.length > 0 ? `
【過去の実績データ（参考）】
${performanceData.map((p: any) => `${p.media_name}: 応募${p.applications}件、コスト¥${p.cost?.toLocaleString() || 0}、採用${p.hires}件`).join('\n')}
` : ''}

JSON形式で推薦結果を出力してください。`;

    // Call Claude API
    const responseText = await callClaude(
      anthropicApiKey,
      [{ role: 'user', content: userPrompt }],
      systemPrompt,
      2048
    );

    // Parse the response
    let recommendations: MediaRecommendation[];
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const parsed = JSON.parse(jsonMatch[0]);
      recommendations = parsed.recommendations;
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      throw new Error('Failed to parse AI response');
    }

    // Save recommendations to database
    const recommendationsToInsert = recommendations.map((rec) => ({
      job_posting_id,
      media_name: rec.media_name,
      ranking: rec.ranking,
      reason: rec.reason,
      estimated_reach: rec.estimated_reach,
      estimated_cost: rec.estimated_cost,
      estimated_applications: rec.estimated_applications,
      estimated_cpa: rec.estimated_cpa,
    }));

    // Delete existing recommendations for this job posting
    await supabase
      .from('media_recommendations')
      .delete()
      .eq('job_posting_id', job_posting_id);

    // Insert new recommendations
    const { data: savedRecommendations, error: insertError } = await supabase
      .from('media_recommendations')
      .insert(recommendationsToInsert)
      .select();

    if (insertError) {
      console.error('Failed to save recommendations:', insertError);
      throw new Error('Failed to save recommendations');
    }

    return new Response(
      JSON.stringify({
        success: true,
        recommendations: savedRecommendations,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-media-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
