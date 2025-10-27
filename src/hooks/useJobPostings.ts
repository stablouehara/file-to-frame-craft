import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface JobPosting {
  id: string;
  user_id: string;
  company_id?: string;
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  employment_type: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  industry?: string;
  status: 'draft' | 'active' | 'paused' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface PerformanceData {
  id: string;
  job_posting_id: string;
  media_name: string;
  date: string;
  impressions: number;
  clicks: number;
  applications: number;
  interviews: number;
  hires: number;
  cost: number;
}

export function useJobPostings() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobPostings();
  }, []);

  const fetchJobPostings = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setJobPostings([]);
        return;
      }

      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobPostings(data || []);
    } catch (err: any) {
      console.error('Failed to fetch job postings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createJobPosting = async (jobPosting: Omit<JobPosting, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<JobPosting> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('認証が必要です');
      }

      const { data, error } = await supabase
        .from('job_postings')
        .insert([{ ...jobPosting, user_id: session.user.id }])
        .select()
        .single();

      if (error) throw error;

      // Refresh the list
      await fetchJobPostings();

      return data;
    } catch (err: any) {
      console.error('Failed to create job posting:', err);
      throw err;
    }
  };

  const updateJobPosting = async (id: string, updates: Partial<JobPosting>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('job_postings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await fetchJobPostings();
    } catch (err: any) {
      console.error('Failed to update job posting:', err);
      throw err;
    }
  };

  const deleteJobPosting = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await fetchJobPostings();
    } catch (err: any) {
      console.error('Failed to delete job posting:', err);
      throw err;
    }
  };

  return {
    jobPostings,
    loading,
    error,
    fetchJobPostings,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
  };
}

export function usePerformanceData(jobPostingId?: string) {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPerformanceData();
  }, [jobPostingId]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setPerformanceData([]);
        return;
      }

      let query = supabase
        .from('performance_data')
        .select('*')
        .order('date', { ascending: false });

      if (jobPostingId) {
        query = query.eq('job_posting_id', jobPostingId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPerformanceData(data || []);
    } catch (err: any) {
      console.error('Failed to fetch performance data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPerformanceData = async (data: Omit<PerformanceData, 'id'>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('performance_data')
        .insert([data]);

      if (error) throw error;

      // Refresh the data
      await fetchPerformanceData();
    } catch (err: any) {
      console.error('Failed to add performance data:', err);
      throw err;
    }
  };

  return {
    performanceData,
    loading,
    error,
    fetchPerformanceData,
    addPerformanceData,
  };
}
