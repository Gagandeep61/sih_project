export type UserRole = 'citizen' | 'university' | 'industry' | 'admin';

export type ProblemStatus = 'pending' | 'assigned' | 'in_progress' | 'testing' | 'completed' | 'failed';

export type DomainCategory =
  | 'Education'
  | 'Healthcare'
  | 'Agriculture'
  | 'Water Management'
  | 'Sanitation'
  | 'Environment'
  | 'Energy'
  | 'Urban Infrastructure'
  | 'Accessibility'
  | 'Public Administration'
  | 'Rural Livelihoods';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  org_name?: string;
  district?: string;
  domain_tags?: DomainCategory[];
  facilities?: string;
  expertise?: string;
  interest_type?: 'funding' | 'mentorship' | 'both';
  avatar_url?: string;
  phone?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  domain: DomainCategory;
  district: string;
  lat?: number;
  lng?: number;
  location_source: 'auto' | 'manual';
  photo_urls: string[];
  status: ProblemStatus;
  support_count: number;
  submitted_by?: string;
  submitted_by_name?: string;
  submitted_by_type: string;
  assigned_university_id?: string;
  assigned_university_name?: string;
  created_at: string;
}

export interface ProblemSupporter {
  id: string;
  problem_id: string;
  user_id: string;
  created_at: string;
}

export interface StudentMember {
  student_name: string;
  student_roll_no: string;
}

export interface Proposal {
  id: string;
  problem_id: string;
  university_id: string;
  university_name: string;
  mentor_name: string;
  mentor_department: string;
  mentor_email: string;
  description: string;
  timeline: string;
  estimated_budget: number;
  ip_notice_ack: boolean;
  cancellation_reason?: string;
  status: 'submitted' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  students?: StudentMember[];
  created_at: string;
}

export interface IndustryInterest {
  id: string;
  proposal_id: string;
  industry_id: string;
  industry_name: string;
  interest_type: 'funding' | 'mentorship' | 'both';
  funding_amount: number;
  message: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  problem_id: string;
  title: string;
  status: 'pending' | 'completed';
  completed_at?: string;
  created_at: string;
}

export interface ImpactMetric {
  id: string;
  problem_id: string;
  people_benefited: number;
  cost_saved: number;
  before_photo_url: string;
  after_photo_url: string;
  citizen_rating: number;
  citizen_feedback: string;
  created_at: string;
}

export interface AccessCode {
  id: string;
  code: string;
  role_type: 'university' | 'industry';
  org_name: string;
  is_used: boolean;
  redeemed_by?: string;
  created_at: string;
}

export interface MatchScoreResult {
  totalScore: number;
  domainScore: number;
  districtScore: number;
  keywordScore: number;
  domainOverlap: string[];
  districtMatch: boolean;
  matchedKeywords: string[];
  explanation: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}
