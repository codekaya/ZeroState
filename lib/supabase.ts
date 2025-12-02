import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          name: string;
          email: string;
          identity_commitment: string;
          joined_at: string;
          status: 'active' | 'inactive';
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          identity_commitment: string;
          joined_at?: string;
          status?: 'active' | 'inactive';
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          identity_commitment?: string;
          joined_at?: string;
          status?: 'active' | 'inactive';
        };
      };
      feedback: {
        Row: {
          id: string;
          content: string;
          category: 'facilities' | 'food' | 'events' | 'community' | 'ideas';
          is_anonymous: boolean;
          author_nullifier: string | null;
          author_id: string | null;
          zk_proof: any;
          status: 'open' | 'in_progress' | 'resolved';
          upvotes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          category: 'facilities' | 'food' | 'events' | 'community' | 'ideas';
          is_anonymous: boolean;
          author_nullifier?: string | null;
          author_id?: string | null;
          zk_proof: any;
          status?: 'open' | 'in_progress' | 'resolved';
          upvotes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          category?: 'facilities' | 'food' | 'events' | 'community' | 'ideas';
          is_anonymous?: boolean;
          author_nullifier?: string | null;
          author_id?: string | null;
          zk_proof?: any;
          status?: 'open' | 'in_progress' | 'resolved';
          upvotes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      replies: {
        Row: {
          id: string;
          feedback_id: string;
          content: string;
          is_anonymous: boolean;
          author_nullifier: string | null;
          author_id: string | null;
          zk_proof: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          feedback_id: string;
          content: string;
          is_anonymous: boolean;
          author_nullifier?: string | null;
          author_id?: string | null;
          zk_proof: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          feedback_id?: string;
          content?: string;
          is_anonymous?: boolean;
          author_nullifier?: string | null;
          author_id?: string | null;
          zk_proof?: any;
          created_at?: string;
        };
      };
      upvotes: {
        Row: {
          id: string;
          feedback_id: string;
          nullifier: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          feedback_id: string;
          nullifier: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          feedback_id?: string;
          nullifier?: string;
          created_at?: string;
        };
      };
    };
  };
};

