import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  UserRole,
  Problem,
  Milestone,
  Proposal,
  IndustryInterest,
  ImpactMetric,
  AccessCode,
  SupabaseConfig,
  StudentMember,
} from '../types';
import {
  DEMO_PROFILES,
  INITIAL_PROBLEMS,
  INITIAL_MILESTONES,
  INITIAL_IMPACT_METRICS,
  INITIAL_ACCESS_CODES,
} from '../constants';
import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  pullSupabaseData,
  pushProblemToSupabase,
  getSupabaseClient,
} from '../lib/supabase';
import confetti from 'canvas-confetti';

interface AppContextType {
  currentUser: UserProfile | null;
  language: 'en' | 'hi';
  deviceFrame: 'pixel' | 'iphone' | 'fullscreen';
  setLanguage: (lang: 'en' | 'hi') => void;
  setDeviceFrame: (frame: 'pixel' | 'iphone' | 'fullscreen') => void;
  quickLoginAs: (user: UserProfile) => void;
  logout: () => void;
  registerUser: (data: Partial<UserProfile>, accessCode?: string) => { success: boolean; message: string };

  // Data collections
  problems: Problem[];
  milestones: Milestone[];
  proposals: Proposal[];
  industryInterests: IndustryInterest[];
  impactMetrics: ImpactMetric[];
  accessCodes: AccessCode[];
  supportedProblemIds: string[];

  // Actions
  submitProblem: (data: Omit<Problem, 'id' | 'created_at' | 'support_count' | 'status'>) => Promise<Problem>;
  toggleProblemSupport: (problemId: string) => void;
  submitProposal: (
    proposal: Omit<Proposal, 'id' | 'created_at' | 'status'>,
    students: StudentMember[],
  ) => void;
  toggleMilestone: (milestoneId: string) => void;
  expressIndustryInterest: (data: Omit<IndustryInterest, 'id' | 'created_at'>) => void;
  adminOverrideAssignment: (problemId: string, universityId: string) => void;
  adminGenerateAccessCode: (role_type: 'university' | 'industry', org_name: string) => AccessCode;
  submitCitizenRating: (problemId: string, rating: number, feedback: string) => void;

  // Supabase Sync
  supabaseConfig: SupabaseConfig;
  isSyncing: boolean;
  syncWithSupabase: () => Promise<{ success: boolean; message: string }>;
  updateSupabaseConfig: (url: string, key: string) => Promise<{ success: boolean; message: string }>;

  // UI helpers
  triggerHaptics: () => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
  toast: { title: string; message: string; type: 'success' | 'info' | 'error' } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  USER: 'jh_pragati_user',
  PROBLEMS: 'jh_pragati_problems',
  MILESTONES: 'jh_pragati_milestones',
  PROPOSALS: 'jh_pragati_proposals',
  INTERESTS: 'jh_pragati_interests',
  IMPACTS: 'jh_pragati_impacts',
  CODES: 'jh_pragati_codes',
  SUPPORTS: 'jh_pragati_supports',
  LANG: 'jh_pragati_lang',
  DEVICE: 'jh_pragati_device',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language & Device Frame
  const [language, setLanguageState] = useState<'en' | 'hi'>('en');
  const [deviceFrame, setDeviceFrameState] = useState<'pixel' | 'iphone' | 'fullscreen'>('pixel');

  // 2. Local User Authentication
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default to Citizen Ramesh Kumar for immediate interactive evaluation
    return DEMO_PROFILES[1];
  });

  // 3. Database Collections
  const [problems, setProblems] = useState<Problem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PROBLEMS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PROBLEMS;
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.MILESTONES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MILESTONES;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PROPOSALS);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed initial proposals
    return [
      {
        id: 'prop-001',
        problem_id: 'd1111111-1111-1111-1111-111111111111',
        university_id: 'usr-univ-002',
        university_name: 'BIT Mesra',
        mentor_name: 'Dr. Anand Swaroop',
        mentor_department: 'Chemical & Environmental Engineering',
        mentor_email: 'aswaroop@bitmesra.ac.in',
        description:
          'Low-cost nano-adsorbent filtration columns utilizing locally sourced iron-binding clay pellets with 99.4% arsenic chelation rate.',
        timeline: '3 Months (Pilot deployment in Namkum)',
        estimated_budget: 250000,
        ip_notice_ack: true,
        status: 'completed',
        created_at: '2026-08-02T10:00:00Z',
        students: [
          { student_name: 'Priyanka Sharma', student_roll_no: 'BTECH/ENV/22/041' },
          { student_name: 'Rahul Murmu', student_roll_no: 'BTECH/ENV/22/058' },
        ],
      },
      {
        id: 'prop-002',
        problem_id: 'd3333333-3333-3333-3333-333333333333',
        university_id: 'usr-univ-001',
        university_name: 'IIT (ISM) Dhanbad',
        mentor_name: 'Prof. S. K. Mahato',
        mentor_department: 'Mining & Environmental Science',
        mentor_email: 'skmahato@iitism.ac.in',
        description:
          'Constructed limestone channel bioreactor to neutralize acid mine runoff before mixing into the Damodar river catchment.',
        timeline: '6 Months',
        estimated_budget: 450000,
        ip_notice_ack: true,
        status: 'in_progress',
        created_at: '2026-08-14T09:00:00Z',
        students: [
          { student_name: 'Vikas Kumar', student_roll_no: 'IITISM/MN/2023/112' },
          { student_name: 'Sneha Kumari', student_roll_no: 'IITISM/ENV/2023/045' },
        ],
      },
      {
        id: 'prop-003',
        problem_id: 'd4444444-4444-4444-4444-444444444444',
        university_id: 'usr-univ-002',
        university_name: 'BIT Mesra',
        mentor_name: 'Dr. Rajiv Ranjan',
        mentor_department: 'Computer Science & IoT Lab',
        mentor_email: 'rranjan@bitmesra.ac.in',
        description: 'Edge-AI vision sensors on Albert Ekka Chowk to dynamically adjust green signal cycles.',
        timeline: '4 Months',
        estimated_budget: 320000,
        ip_notice_ack: true,
        status: 'submitted',
        created_at: '2026-08-20T11:00:00Z',
        students: [
          { student_name: 'Amitabh Oraon', student_roll_no: 'BIT/CSE/22/019' },
        ],
      },
      {
        id: 'prop-004-rejected',
        problem_id: 'd9999999-9999-9999-9999-999999999999',
        university_id: 'usr-univ-005',
        university_name: 'Usha Martin University',
        mentor_name: 'Dr. Neha Agarwal',
        mentor_department: 'Management & IT',
        mentor_email: 'neha.agarwal@umu.ac.in',
        description: 'Single-tier desktop portal without offline synchronization for land records.',
        timeline: '2 Months',
        estimated_budget: 150000,
        ip_notice_ack: true,
        cancellation_reason:
          'Insufficient offline sync resilience for remote rural block offices during power cuts. Archived to Lessons Learned.',
        status: 'rejected',
        created_at: '2026-08-10T12:00:00Z',
      },
    ];
  });

  const [industryInterests, setIndustryInterests] = useState<IndustryInterest[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.INTERESTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'ind-int-001',
        proposal_id: 'prop-001',
        industry_id: 'usr-ind-001',
        industry_name: 'Tata Steel Limited',
        interest_type: 'both',
        funding_amount: 250000,
        message: 'Tata Steel Foundation will grant 100% of pilot budget and provide metallurgy lab verification.',
        created_at: '2026-08-04T14:00:00Z',
      },
      {
        id: 'ind-int-002',
        proposal_id: 'prop-002',
        industry_id: 'usr-ind-002',
        industry_name: 'Central Coalfields Ltd (CCL)',
        interest_type: 'funding',
        funding_amount: 300000,
        message: 'CCL CSR grant for passive mine water neutralization pilot at Katras area.',
        created_at: '2026-08-16T15:30:00Z',
      },
    ];
  });

  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.IMPACTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_IMPACT_METRICS;
  });

  const [accessCodes, setAccessCodes] = useState<AccessCode[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CODES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ACCESS_CODES;
  });

  const [supportedProblemIds, setSupportedProblemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SUPPORTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['d1111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333'];
  });

  // 4. Supabase Sync Config
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSavedSupabaseConfig);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // 5. Toast Feedback
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'info' | 'error' } | null>(
    null,
  );

  const showToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.title === title ? null : prev));
    }, 4000);
  }, []);

  const triggerHaptics = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROBLEMS, JSON.stringify(problems));
  }, [problems]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.INTERESTS, JSON.stringify(industryInterests));
  }, [industryInterests]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.IMPACTS, JSON.stringify(impactMetrics));
  }, [impactMetrics]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CODES, JSON.stringify(accessCodes));
  }, [accessCodes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SUPPORTS, JSON.stringify(supportedProblemIds));
  }, [supportedProblemIds]);

  const setLanguage = useCallback((lang: 'en' | 'hi') => {
    setLanguageState(lang);
    showToast(
      lang === 'hi' ? 'भाषा बदली गई' : 'Language Switched',
      lang === 'hi' ? 'झारखण्ड प्रगति सेतु हिन्दी मोड सक्रिय' : 'Jharkhand Pragati Setu English Mode Active',
      'info',
    );
  }, [showToast]);

  const setDeviceFrame = useCallback((frame: 'pixel' | 'iphone' | 'fullscreen') => {
    setDeviceFrameState(frame);
    triggerHaptics();
  }, [triggerHaptics]);

  // Auth Functions
  const quickLoginAs = useCallback(
    (user: UserProfile) => {
      setCurrentUser(user);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
      triggerHaptics();
      showToast(
        'Authenticated Successfully',
        `Logged in as ${user.name} (${user.role.toUpperCase()})`,
        'success',
      );
    },
    [triggerHaptics, showToast],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    triggerHaptics();
    showToast('Logged Out', 'Signed out from local session', 'info');
  }, [triggerHaptics, showToast]);

  const registerUser = useCallback(
    (data: Partial<UserProfile>, accessCode?: string) => {
      const role = data.role || 'citizen';

      // If university or industry, require access code verification
      if (role === 'university' || role === 'industry') {
        if (!accessCode) {
          return { success: false, message: 'Institutional access code (PREFIX-JH-####) is mandatory' };
        }
        const cleanCode = accessCode.trim().toUpperCase();
        const found = accessCodes.find((c) => c.code === cleanCode && !c.is_used);
        if (!found) {
          return { success: false, message: 'Invalid or already redeemed access code' };
        }
        if (found.role_type !== role) {
          return {
            success: false,
            message: `This code is designated for ${found.role_type} onboarding, but ${role} was selected`,
          };
        }

        // Mark code used
        setAccessCodes((prev) =>
          prev.map((c) => (c.code === cleanCode ? { ...c, is_used: true, redeemed_by: data.id } : c)),
        );
      }

      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: data.name || 'Anonymous',
        email: data.email || 'user@jharkhand.gov.in',
        role: role as UserRole,
        org_name: data.org_name,
        district: data.district || 'Ranchi',
        domain_tags: data.domain_tags || [],
        facilities: data.facilities,
        expertise: data.expertise,
        interest_type: data.interest_type,
        phone: data.phone,
      };

      setCurrentUser(newUser);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(newUser));
      showToast('Registration Complete', `Welcome to Pragati Setu, ${newUser.name}!`, 'success');
      return { success: true, message: 'Registration complete' };
    },
    [accessCodes, showToast],
  );

  // Problem Submission
  const submitProblem = useCallback(
    async (data: Omit<Problem, 'id' | 'created_at' | 'support_count' | 'status'>): Promise<Problem> => {
      const newProblem: Problem = {
        ...data,
        id: `prob-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        status: 'pending',
        support_count: 1, // Author's first vote
        created_at: new Date().toISOString(),
        submitted_by: currentUser?.id,
        submitted_by_name: currentUser?.name || 'Citizen Reporter',
      };

      // Add to local state
      setProblems((prev) => [newProblem, ...prev]);
      setSupportedProblemIds((prev) => [...prev, newProblem.id]);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}

      // Push to Supabase if connected
      const client = getSupabaseClient();
      if (client && supabaseConfig.isConnected) {
        pushProblemToSupabase(newProblem).then((res) => {
          if (res.success) {
            showToast('Cloud Synced', 'Problem recorded on Supabase & local state', 'success');
          }
        });
      }

      showToast(
        'Challenge Submitted',
        `Assigned ID #${newProblem.id.slice(0, 8)} to District Admin Queue`,
        'success',
      );
      return newProblem;
    },
    [currentUser, supabaseConfig, showToast],
  );

  // 1-Vote-Per-Citizen Upvote Support Toggler
  const toggleProblemSupport = useCallback(
    (problemId: string) => {
      triggerHaptics();
      setSupportedProblemIds((prev) => {
        const isSupported = prev.includes(problemId);
        if (isSupported) {
          // Remove vote
          setProblems((pList) =>
            pList.map((p) => (p.id === problemId ? { ...p, support_count: Math.max(0, p.support_count - 1) } : p)),
          );
          showToast('Vote Removed', 'You withdrew your support from this issue', 'info');
          return prev.filter((id) => id !== problemId);
        } else {
          // Add vote
          setProblems((pList) =>
            pList.map((p) => (p.id === problemId ? { ...p, support_count: p.support_count + 1 } : p)),
          );
          showToast('Supported!', '+1 Citizen Vote added to escalate district priority', 'success');
          return [...prev, problemId];
        }
      });
    },
    [triggerHaptics, showToast],
  );

  // University Proposal Submission
  const submitProposal = useCallback(
    (proposalData: Omit<Proposal, 'id' | 'created_at' | 'status'>, students: StudentMember[]) => {
      const newProposal: Proposal = {
        ...proposalData,
        id: `prop-${Date.now()}`,
        status: 'submitted',
        students,
        created_at: new Date().toISOString(),
      };

      setProposals((prev) => [newProposal, ...prev]);

      // Update problem status to 'assigned'
      setProblems((prev) =>
        prev.map((p) =>
          p.id === proposalData.problem_id
            ? {
                ...p,
                status: 'assigned',
                assigned_university_id: proposalData.university_id,
                assigned_university_name: proposalData.university_name,
              }
            : p,
        ),
      );

      // Create initial milestones for this solution
      const m1: Milestone = {
        id: `m-${Date.now()}-1`,
        problem_id: proposalData.problem_id,
        title: 'Project Inception & Baseline Site Diagnostic',
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      const m2: Milestone = {
        id: `m-${Date.now()}-2`,
        problem_id: proposalData.problem_id,
        title: 'Prototype Fabrication & Lab Validation',
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      const m3: Milestone = {
        id: `m-${Date.now()}-3`,
        problem_id: proposalData.problem_id,
        title: 'Ground Field Deployment & Operational Handover',
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      setMilestones((prev) => [...prev, m1, m2, m3]);

      try {
        confetti({ particleCount: 60, spread: 70 });
      } catch {}

      showToast(
        'Proposal Submitted',
        `Faculty Mentor & ${students.length} Student Team registered for solving this issue!`,
        'success',
      );
    },
    [showToast],
  );

  // Milestone Progression (Database Trigger logic simulated locally & synced)
  const toggleMilestone = useCallback(
    (milestoneId: string) => {
      triggerHaptics();
      setMilestones((prev) => {
        let targetProblemId: string | null = null;
        const updated = prev.map((m) => {
          if (m.id === milestoneId) {
            targetProblemId = m.problem_id;
            const newStatus: 'pending' | 'completed' = m.status === 'completed' ? 'pending' : 'completed';
            return {
              ...m,
              status: newStatus,
              completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
            };
          }
          return m;
        });

        // Trigger: sync problem status based on milestone completion
        if (targetProblemId) {
          const problemMilestones = updated.filter((m) => m.problem_id === targetProblemId);
          const total = problemMilestones.length;
          const completedCount = problemMilestones.filter((m) => m.status === 'completed').length;

          setProblems((pList) =>
            pList.map((p) => {
              if (p.id === targetProblemId) {
                if (total > 0 && completedCount === total) {
                  return { ...p, status: 'completed' };
                } else if (completedCount > 0) {
                  return { ...p, status: 'in_progress' };
                }
              }
              return p;
            }),
          );
        }

        return updated;
      });

      showToast('Milestone Updated', 'Problem status recalculated automatically via state machine', 'success');
    },
    [triggerHaptics, showToast],
  );

  // Industry CSR Interest
  const expressIndustryInterest = useCallback(
    (data: Omit<IndustryInterest, 'id' | 'created_at'>) => {
      const newInterest: IndustryInterest = {
        ...data,
        id: `csr-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      setIndustryInterests((prev) => [newInterest, ...prev]);

      try {
        confetti({ particleCount: 70, spread: 80 });
      } catch {}

      showToast(
        'CSR Commitment Pledged',
        `₹${data.funding_amount.toLocaleString()} pledged under Section 135 CSR mandate`,
        'success',
      );
    },
    [showToast],
  );

  // Admin Assignment Override
  const adminOverrideAssignment = useCallback(
    (problemId: string, universityId: string) => {
      const univ = DEMO_PROFILES.find((u) => u.id === universityId);
      setProblems((prev) =>
        prev.map((p) =>
          p.id === problemId
            ? {
                ...p,
                status: 'assigned',
                assigned_university_id: universityId,
                assigned_university_name: univ?.org_name || univ?.name || 'Reassigned University',
              }
            : p,
        ),
      );
      showToast(
        'Assignment Overridden',
        `State Admin reassigned problem to ${univ?.name || 'University'}`,
        'info',
      );
    },
    [showToast],
  );

  // Admin Access Code Generator
  const adminGenerateAccessCode = useCallback(
    (role_type: 'university' | 'industry', org_name: string): AccessCode => {
      const prefix = role_type === 'university' ? 'UNIV-JH' : 'IND-JH';
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newCode: AccessCode = {
        id: `code-${Date.now()}`,
        code: `${prefix}-${randomNum}`,
        role_type,
        org_name,
        is_used: false,
        created_at: new Date().toISOString(),
      };
      setAccessCodes((prev) => [newCode, ...prev]);
      showToast('Access Code Created', `Single-use token: ${newCode.code} for ${org_name}`, 'success');
      return newCode;
    },
    [showToast],
  );

  // Citizen 1-5 Star Rating & Feedback
  const submitCitizenRating = useCallback(
    (problemId: string, rating: number, feedback: string) => {
      const newImpact: ImpactMetric = {
        id: `imp-${Date.now()}`,
        problem_id: problemId,
        people_benefited: Math.floor(2000 + Math.random() * 10000),
        cost_saved: Math.floor(150000 + Math.random() * 400000),
        before_photo_url:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
        after_photo_url:
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        citizen_rating: rating,
        citizen_feedback: feedback,
        created_at: new Date().toISOString(),
      };
      setImpactMetrics((prev) => [newImpact, ...prev.filter((i) => i.problem_id !== problemId)]);
      showToast('Citizen Rating Recorded', 'Your 5-star resolution feedback has been audited by State Admin', 'success');
    },
    [showToast],
  );

  // Live Supabase Synchronization
  const syncWithSupabase = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    try {
      const res = await pullSupabaseData();
      if (res.error) {
        setIsSyncing(false);
        showToast('Supabase Sync Notice', res.error, 'info');
        return { success: false, message: res.error };
      }

      if (res.problems && res.problems.length > 0) {
        setProblems(res.problems);
      }
      if (res.milestones && res.milestones.length > 0) {
        setMilestones(res.milestones);
      }
      if (res.proposals && res.proposals.length > 0) {
        setProposals(res.proposals);
      }
      if (res.interests && res.interests.length > 0) {
        setIndustryInterests(res.interests);
      }
      if (res.impactMetrics && res.impactMetrics.length > 0) {
        setImpactMetrics(res.impactMetrics);
      }

      const updatedConfig = {
        ...supabaseConfig,
        isConnected: true,
        lastSyncedAt: new Date().toLocaleTimeString(),
      };
      setSupabaseConfig(updatedConfig);
      saveSupabaseConfig(updatedConfig);

      setIsSyncing(false);
      showToast(
        'Supabase Synced',
        `Successfully pulled ${res.problems?.length || 0} problems from remote database`,
        'success',
      );
      return { success: true, message: 'Synced successfully with Supabase!' };
    } catch (err: any) {
      setIsSyncing(false);
      showToast('Sync Failed', err?.message || 'Could not connect to Supabase', 'error');
      return { success: false, message: err?.message || 'Sync failed' };
    }
  }, [supabaseConfig, showToast]);

  const updateSupabaseConfig = useCallback(
    async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
      const newConfig: SupabaseConfig = {
        url: url.trim(),
        anonKey: key.trim(),
        isConnected: false,
      };
      saveSupabaseConfig(newConfig);
      setSupabaseConfig(newConfig);

      if (newConfig.url && newConfig.anonKey) {
        return syncWithSupabase();
      }
      return { success: true, message: 'Configuration saved in local store' };
    },
    [syncWithSupabase],
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        language,
        deviceFrame,
        setLanguage,
        setDeviceFrame,
        quickLoginAs,
        logout,
        registerUser,
        problems,
        milestones,
        proposals,
        industryInterests,
        impactMetrics,
        accessCodes,
        supportedProblemIds,
        submitProblem,
        toggleProblemSupport,
        submitProposal,
        toggleMilestone,
        expressIndustryInterest,
        adminOverrideAssignment,
        adminGenerateAccessCode,
        submitCitizenRating,
        supabaseConfig,
        isSyncing,
        syncWithSupabase,
        updateSupabaseConfig,
        triggerHaptics,
        showToast,
        toast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
