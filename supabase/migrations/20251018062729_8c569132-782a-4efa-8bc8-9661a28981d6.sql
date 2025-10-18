-- ユーザープロフィールテーブル
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 企業情報テーブル
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 求人情報テーブル
CREATE TABLE public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  job_type TEXT,
  location TEXT,
  salary_range TEXT,
  description TEXT,
  requirements TEXT,
  benefits TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 媒体推薦結果テーブル
CREATE TABLE public.media_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE NOT NULL,
  media_name TEXT NOT NULL,
  ranking INTEGER,
  reason TEXT,
  estimated_reach INTEGER,
  estimated_cost DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 広告文テーブル
CREATE TABLE public.ad_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE NOT NULL,
  media_name TEXT NOT NULL,
  title TEXT,
  body TEXT,
  keywords TEXT[],
  version INTEGER DEFAULT 1,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 効果測定データテーブル
CREATE TABLE public.performance_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE NOT NULL,
  media_name TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  applications INTEGER DEFAULT 0,
  interviews INTEGER DEFAULT 0,
  hires INTEGER DEFAULT 0,
  cost DECIMAL DEFAULT 0,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- テンプレートテーブル
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  content JSONB,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ナレッジベーステーブル
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  content TEXT,
  tags TEXT[],
  success_metrics JSONB,
  is_success_case BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLSポリシーを有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- profilesのRLSポリシー
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- companiesのRLSポリシー
CREATE POLICY "Users can view own companies" ON public.companies
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own companies" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own companies" ON public.companies
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own companies" ON public.companies
  FOR DELETE USING (auth.uid() = user_id);

-- job_postingsのRLSポリシー
CREATE POLICY "Users can view own job postings" ON public.job_postings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own job postings" ON public.job_postings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own job postings" ON public.job_postings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own job postings" ON public.job_postings
  FOR DELETE USING (auth.uid() = user_id);

-- media_recommendationsのRLSポリシー
CREATE POLICY "Users can view recommendations for own jobs" ON public.media_recommendations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = media_recommendations.job_posting_id
      AND job_postings.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert recommendations for own jobs" ON public.media_recommendations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = media_recommendations.job_posting_id
      AND job_postings.user_id = auth.uid()
    )
  );

-- ad_copiesのRLSポリシー
CREATE POLICY "Users can view ad copies for own jobs" ON public.ad_copies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = ad_copies.job_posting_id
      AND job_postings.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert ad copies for own jobs" ON public.ad_copies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = ad_copies.job_posting_id
      AND job_postings.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update ad copies for own jobs" ON public.ad_copies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = ad_copies.job_posting_id
      AND job_postings.user_id = auth.uid()
    )
  );

-- performance_dataのRLSポリシー
CREATE POLICY "Users can view performance for own jobs" ON public.performance_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = performance_data.job_posting_id
      AND job_postings.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert performance for own jobs" ON public.performance_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = performance_data.job_posting_id
      AND job_postings.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update performance for own jobs" ON public.performance_data
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE job_postings.id = performance_data.job_posting_id
      AND job_postings.user_id = auth.uid()
    )
  );

-- templatesのRLSポリシー
CREATE POLICY "Users can view own templates" ON public.templates
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own templates" ON public.templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.templates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.templates
  FOR DELETE USING (auth.uid() = user_id);

-- knowledge_baseのRLSポリシー
CREATE POLICY "Users can view public knowledge or own" ON public.knowledge_base
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own knowledge" ON public.knowledge_base
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own knowledge" ON public.knowledge_base
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own knowledge" ON public.knowledge_base
  FOR DELETE USING (auth.uid() = user_id);

-- プロフィール自動作成トリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 更新日時の自動更新関数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルに更新日時トリガーを追加
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_performance_data_updated_at BEFORE UPDATE ON public.performance_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();