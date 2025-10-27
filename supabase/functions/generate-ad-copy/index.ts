import { corsHeaders } from '../_shared/cors.ts';
import { callClaude } from '../_shared/anthropic.ts';
import { createSupabaseClient } from '../_shared/supabase.ts';

interface AdCopyVariant {
  media_name: string;
  title: string;
  body: string;
  keywords: string[];
  version: number;
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

    // Parse request body
    const { job_posting_id, media_name, num_variants = 3 } = await req.json();

    if (!job_posting_id || !media_name) {
      return new Response(
        JSON.stringify({ error: 'job_posting_id and media_name are required' }),
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

    // Fetch successful templates from knowledge base
    const { data: templates } = await supabase
      .from('knowledge_base')
      .select('title, content, tags')
      .eq('category', 'success_case')
      .limit(5);

    // Build the prompt for Claude
    const mediaGuidelines: Record<string, string> = {
      'Indeed': 'タイトル: 35文字以内、本文: 800文字以内。具体的な仕事内容と待遇を明確に記載',
      'Wantedly': 'タイトル: カジュアルで親しみやすく。本文: ストーリー性重視、会社のビジョンやカルチャーを強調',
      'ビズリーチ': 'タイトル: 専門性とポジション名を明確に。本文: キャリアアップ要素、年収レンジ、経営陣との距離感を強調',
      'doda': 'タイトル: 職種名を明確に。本文: 安定性、福利厚生、キャリアパスを詳細に',
      'リクナビNEXT': 'タイトル: わかりやすく魅力的に。本文: 幅広い層に訴求、成長機会を強調',
      'Green': 'タイトル: 技術スタックを明記。本文: 開発環境、使用技術、エンジニア文化を詳細に',
      'エン転職': 'タイトル: 正直で具体的に。本文: 仕事の厳しさも含めて正直に、やりがいを強調',
      'マイナビ転職': 'タイトル: 若手向けに親しみやすく。本文: 成長環境、研修制度、先輩社員の声を含める',
    };

    const guideline = mediaGuidelines[media_name] || 'タイトルは魅力的かつ具体的に、本文は詳細でわかりやすく';

    const systemPrompt = `あなたは日本の採用広告のプロフェッショナルなコピーライターです。求人媒体に最適化された魅力的な広告コピーを作成してください。

【${media_name}の特性】
${guideline}

以下のJSON形式で${num_variants}個のバリエーションを作成してください:
{
  "ad_copies": [
    {
      "title": "広告タイトル",
      "body": "広告本文",
      "keywords": ["キーワード1", "キーワード2", "キーワード3"]
    }
  ]
}

各バリエーションは異なるアプローチ（例: 待遇重視、やりがい重視、成長機会重視など）で作成してください。`;

    const userPrompt = `以下の求人の広告コピーを${media_name}向けに作成してください:

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

${templates && templates.length > 0 ? `
【成功事例（参考）】
${templates.map((t: any) => `・${t.title}: ${t.tags?.join(', ')}`).join('\n')}
` : ''}

JSON形式で${num_variants}個のバリエーションを出力してください。`;

    // Call Claude API
    const responseText = await callClaude(
      anthropicApiKey,
      [{ role: 'user', content: userPrompt }],
      systemPrompt,
      3072
    );

    // Parse the response
    let adCopies: AdCopyVariant[];
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const parsed = JSON.parse(jsonMatch[0]);
      adCopies = parsed.ad_copies.map((copy: any, index: number) => ({
        ...copy,
        media_name,
        version: index + 1,
      }));
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      throw new Error('Failed to parse AI response');
    }

    // Save ad copies to database
    const adCopiesToInsert = adCopies.map((copy) => ({
      job_posting_id,
      media_name: copy.media_name,
      title: copy.title,
      body: copy.body,
      keywords: copy.keywords,
      version: copy.version,
      is_selected: false,
    }));

    // Insert new ad copies
    const { data: savedAdCopies, error: insertError } = await supabase
      .from('ad_copies')
      .insert(adCopiesToInsert)
      .select();

    if (insertError) {
      console.error('Failed to save ad copies:', insertError);
      throw new Error('Failed to save ad copies');
    }

    return new Response(
      JSON.stringify({
        success: true,
        ad_copies: savedAdCopies,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-ad-copy:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
