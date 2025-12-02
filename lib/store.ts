import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Identity } from '@semaphore-protocol/identity';

export type FeedbackCategory = 'facilities' | 'food' | 'events' | 'community' | 'ideas';
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved';

export interface Member {
  id: string;
  name: string;
  email: string;
  identity_commitment: string;
  joined_at: string;
  status: 'active' | 'inactive';
  attributes?: {
    skills?: string[];
    location?: string;
    ageRange?: string;
    [key: string]: any;
  };
}

export interface Feedback {
  id: string;
  content: string;
  category: FeedbackCategory;
  is_anonymous: boolean;
  author_nullifier?: string;
  author_id?: string;
  author_name?: string;
  zk_proof: any;
  status: FeedbackStatus;
  upvotes: number;
  created_at: string;
  updated_at: string;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  feedback_id: string;
  content: string;
  is_anonymous: boolean;
  author_nullifier?: string;
  author_id?: string;
  author_name?: string;
  zk_proof: any;
  created_at: string;
}

interface UserState {
  // User identity (stored locally)
  identitySecret: string | null;
  memberId: string | null;
  memberName: string | null;
  isAdmin: boolean;
  
  // Actions
  setIdentity: (secret: string, memberId: string, name: string) => void;
  clearIdentity: () => void;
  setAdmin: (isAdmin: boolean) => void;
}

interface FeedbackState {
  feedbacks: Feedback[];
  selectedCategory: FeedbackCategory | 'all';
  
  // Actions
  setFeedbacks: (feedbacks: Feedback[]) => void;
  addFeedback: (feedback: Feedback) => void;
  updateFeedback: (id: string, updates: Partial<Feedback>) => void;
  setSelectedCategory: (category: FeedbackCategory | 'all') => void;
}

// User store with persistence
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      identitySecret: null,
      memberId: null,
      memberName: null,
      isAdmin: false,
      
      setIdentity: (secret, memberId, name) => 
        set({ identitySecret: secret, memberId, memberName: name }),
      
      clearIdentity: () => 
        set({ identitySecret: null, memberId: null, memberName: null, isAdmin: false }),
      
      setAdmin: (isAdmin) => 
        set({ isAdmin }),
    }),
    {
      name: 'zk-forum-user',
    }
  )
);

// Feedback store
export const useFeedbackStore = create<FeedbackState>((set) => ({
  feedbacks: [],
  selectedCategory: 'all',
  
  setFeedbacks: (feedbacks) => 
    set({ feedbacks }),
  
  addFeedback: (feedback) => 
    set((state) => ({ 
      feedbacks: [feedback, ...state.feedbacks] 
    })),
  
  updateFeedback: (id, updates) => 
    set((state) => ({
      feedbacks: state.feedbacks.map((f) => 
        f.id === id ? { ...f, ...updates } : f
      ),
    })),
  
  setSelectedCategory: (category) => 
    set({ selectedCategory: category }),
}));


