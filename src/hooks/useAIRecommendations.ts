import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MediaRecommendation {
  id: string;
  job_posting_id: string;
  media_name: string;
  ranking: number;
  reason: string;
  estimated_reach: number;
  estimated_cost: number;
  estimated_applications: number;
  estimated_cpa: number;
}

export function useMediaRecommendations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecommendations = async (jobPostingId: string): Promise<MediaRecommendation[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('認証が必要です');
      }

      const response = await supabase.functions.invoke('generate-media-recommendations', {
        body: { job_posting_id: jobPostingId },
      });

      if (response.error) {
        throw response.error;
      }

      return response.data.recommendations;
    } catch (err: any) {
      const errorMessage = err.message || 'メディア推薦の生成に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async (jobPostingId: string): Promise<MediaRecommendation[]> => {
    try {
      const { data, error } = await supabase
        .from('media_recommendations')
        .select('*')
        .eq('job_posting_id', jobPostingId)
        .order('ranking', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Failed to fetch recommendations:', err);
      return [];
    }
  };

  return {
    generateRecommendations,
    getRecommendations,
    loading,
    error,
  };
}

export interface AdCopy {
  id: string;
  job_posting_id: string;
  media_name: string;
  title: string;
  body: string;
  keywords: string[];
  version: number;
  is_selected: boolean;
}

export function useAdCopyGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAdCopy = async (
    jobPostingId: string,
    mediaName: string,
    numVariants: number = 3
  ): Promise<AdCopy[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('認証が必要です');
      }

      const response = await supabase.functions.invoke('generate-ad-copy', {
        body: {
          job_posting_id: jobPostingId,
          media_name: mediaName,
          num_variants: numVariants,
        },
      });

      if (response.error) {
        throw response.error;
      }

      return response.data.ad_copies;
    } catch (err: any) {
      const errorMessage = err.message || '広告コピーの生成に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAdCopies = async (jobPostingId: string, mediaName?: string): Promise<AdCopy[]> => {
    try {
      let query = supabase
        .from('ad_copies')
        .select('*')
        .eq('job_posting_id', jobPostingId);

      if (mediaName) {
        query = query.eq('media_name', mediaName);
      }

      const { data, error } = await query.order('version', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Failed to fetch ad copies:', err);
      return [];
    }
  };

  const selectAdCopy = async (adCopyId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('ad_copies')
        .update({ is_selected: true })
        .eq('id', adCopyId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Failed to select ad copy:', err);
      throw err;
    }
  };

  return {
    generateAdCopy,
    getAdCopies,
    selectAdCopy,
    loading,
    error,
  };
}

export interface Insight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
  priority: number;
}

export interface InsightsResponse {
  insights: Insight[];
  stats: {
    total_job_postings: number;
    active_job_postings: number;
    total_applications: number;
    total_hires: number;
    total_cost: number;
    avg_cpa: number;
    conversion_rate: string;
  };
  media_performance: Record<string, {
    applications: number;
    cost: number;
    hires: number;
    impressions: number;
    cpa: number;
    ctr: string;
  }>;
}

export function useInsights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async (): Promise<InsightsResponse> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('認証が必要です');
      }

      const response = await supabase.functions.invoke('generate-insights', {
        body: {},
      });

      if (response.error) {
        throw response.error;
      }

      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'インサイトの生成に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    generateInsights,
    loading,
    error,
  };
}
