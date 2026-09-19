import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_PROFILES, JHARKHAND_DISTRICTS } from '../../constants';
import { Problem, AccessCode } from '../../types';
import {
  BarChart3,
  SlidersHorizontal,
  KeyRound,
  FileText,
  ShieldCheck,
  Plus,
  Copy,
  Check,
  Building2,
  Users,
  Award,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface AdminPortalProps {
  activeSubView?: 'overview' | 'override' | 'codes' | 'proofs';
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ activeSubView = 'overview' }) => {
  const {
    problems,
    proposals,
    industryInterests,
    impactMetrics,
    accessCodes,
    adminOverrideAssignment,
    adminGenerateAccessCode,
    language,
    triggerHaptics,
  } = useApp();

  const [subView, setSubView] = useState<'overview' | 'override' | 'codes' | 'proofs'>(activeSubView);

  // Access Code Generation State
  const [newOrgName, setNewOrgName] = useState('');
  const [newRoleType, setNewRoleType] = useState<'university' | 'industry'>('university');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Override State
  const [overrideProblemId, setOverrideProblemId] = useState<string>(problems[0]?.id || '');
  const [targetUnivId, setTargetUnivId] = useState<string>(
    DEMO_PROFILES.find((p) => p.role === 'university')?.id || '',
  );

  // Calculate State-wide KPIs
  const totalProblems = problems.length;
  const resolvedCount = problems.filter((p) => p.status === 'completed').length;
  const inProgressCount = problems.filter((p) => p.status === 'in_progress').length;
  const totalBenefited = impactMetrics.reduce((sum, i) => sum + (i.people_benefited || 0), 0);
  const totalCsrPledged = industryInterests.reduce((sum, i) => sum + (i.funding_amount || 0), 0);

  const handleGenerateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    triggerHaptics();
    adminGenerateAccessCode(newRoleType, newOrgName.trim());
    setNewOrgName('');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    triggerHaptics();
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExecuteOverride = () => {
    if (!overrideProblemId || !targetUnivId) return;
    triggerHaptics();
    adminOverrideAssignment(overrideProblemId, targetUnivId);
  };

  const universities = DEMO_PROFILES.filter((p) => p.role === 'university');

  return (
    <div className="pb-8">
      {/* Admin Header */}
      <div className="bg-[#1B5E20] text-white px-4 pt-3 pb-4 shadow-inner">
        <span className="text-[10px] font-bold tracking-wider uppercase bg-[#E65100] text-white px-2 py-0.5 rounded-full">
          State Administrative Authority
        </span>
        <h2 className="text-base font-black mt-1">
          {language === 'hi' ? 'झारखण्ड राज्य शासन निगरानी केंद्र' : 'Jharkhand State Command Centre'}
        </h2>
        <p className="text-[11px] text-emerald-100">
          Executive oversight, algorithm override authority & institutional access management
        </p>

        {/* Sub navigation */}
        <div className="flex items-center gap-1.5 mt-3 bg-black/20 p-1 rounded-xl">
          <button
            onClick={() => setSubView('overview')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              subView === 'overview' ? 'bg-white text-[#1B5E20] shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            State KPIs
          </button>
          <button
            onClick={() => setSubView('override')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              subView === 'override' ? 'bg-white text-[#1B5E20] shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            Override
          </button>
          <button
            onClick={() => setSubView('codes')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              subView === 'codes' ? 'bg-white text-[#1B5E20] shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            Access Codes
          </button>
          <button
            onClick={() => setSubView('proofs')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              subView === 'proofs' ? 'bg-white text-[#1B5E20] shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            Audit Proofs
          </button>
        </div>
      </div>

      {/* VIEW 1: STATE OVERVIEW & KPIS */}
      {subView === 'overview' && (
        <div className="p-3.5 space-y-3">
          {/* Executive Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
              <div className="text-[10px] font-bold text-stone-500 uppercase">Total Problems</div>
              <div className="text-xl font-black text-stone-900 font-mono mt-0.5">{totalProblems}</div>
              <div className="text-[10px] text-emerald-700 font-medium">Across 24 Districts</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
              <div className="text-[10px] font-bold text-stone-500 uppercase">Ground Resolved</div>
              <div className="text-xl font-black text-[#1B5E20] font-mono mt-0.5">{resolvedCount}</div>
              <div className="text-[10px] text-stone-500 font-medium">Verified by Citizens</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
              <div className="text-[10px] font-bold text-stone-500 uppercase">CSR Capital Pledged</div>
              <div className="text-base font-black text-stone-900 font-mono mt-0.5">
                ₹{(totalCsrPledged / 100000).toFixed(1)} Lakhs
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">Section 135 Mandate</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
              <div className="text-[10px] font-bold text-stone-500 uppercase">Citizens Benefited</div>
              <div className="text-base font-black text-stone-900 font-mono mt-0.5">
                {totalBenefited.toLocaleString()}+
              </div>
              <div className="text-[10px] text-stone-500 font-medium">Audit Proofs Verified</div>
            </div>
          </div>

          {/* Academic Leaderboard */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Building2 size={15} className="text-[#1B5E20]" />
                <span>University Resolution Leaderboard</span>
              </span>
              <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono">
                Ranking
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {universities.map((univ, index) => {
                const assigned = problems.filter((p) => p.assigned_university_id === univ.id).length;
                const completed = problems.filter(
                  (p) => p.assigned_university_id === univ.id && p.status === 'completed',
                ).length;

                return (
                  <div
                    key={univ.id}
                    className="p-2 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#1B5E20] text-white flex items-center justify-center text-[10px] font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-bold text-stone-900 text-[11px]">{univ.name}</div>
                        <div className="text-[9px] text-stone-500">{univ.district}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#1B5E20] text-[11px]">{completed} Solved</div>
                      <div className="text-[9px] text-stone-400">{assigned} Allocated</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ASSIGNMENT OVERRIDE CENTER */}
      {subView === 'override' && (
        <div className="p-3.5 space-y-3">
          <div className="text-xs text-stone-600 bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-start gap-2">
            <SlidersHorizontal size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900">State Administrative Override Authority:</span>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-tight">
                While the matching algorithm is deterministic, state administrators possess legal authority to reassign allocations based on urgent ground policy priorities.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-stone-800">Reassign Societal Problem</h3>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">Select Challenge</label>
              <select
                value={overrideProblemId}
                onChange={(e) => setOverrideProblemId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
              >
                {problems.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.district}] {p.title} ({p.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Assign to University / Technical Institute
              </label>
              <select
                value={targetUnivId}
                onChange={(e) => setTargetUnivId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
              >
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.district})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleExecuteOverride}
              className="w-full py-2.5 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>Execute Administrative Override</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: ACCESS CODE MANAGER */}
      {subView === 'codes' && (
        <div className="p-3.5 space-y-3">
          {/* Code Generator Form */}
          <form onSubmit={handleGenerateCode} className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <KeyRound size={15} className="text-[#1B5E20]" />
              <span>Generate Single-Use Institutional Access Code</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-1">Entity Category</label>
                <select
                  value={newRoleType}
                  onChange={(e) => setNewRoleType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                >
                  <option value="university">University (UNIV-JH-####)</option>
                  <option value="industry">Industry (IND-JH-####)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-1">Institution Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kolhan University"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#1B5E20] text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1"
            >
              <Plus size={13} />
              <span>Issue Single-Use Token</span>
            </button>
          </form>

          {/* Code Inventory List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-700">Issued Access Tokens</span>
            <div className="space-y-1.5">
              {accessCodes.map((code) => (
                <div
                  key={code.id}
                  className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between text-xs shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 text-sm tracking-wider">
                        {code.code}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          code.is_used
                            ? 'bg-stone-100 text-stone-500'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {code.is_used ? 'Redeemed' : 'Active'}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      {code.org_name} ({code.role_type})
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyCode(code.code)}
                    className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600"
                    title="Copy code to clipboard"
                  >
                    {copiedCode === code.code ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: AUDIT PROOFS */}
      {subView === 'proofs' && (
        <div className="p-3.5 space-y-3">
          <div className="text-xs text-stone-600 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
            <strong>State Audit Verification:</strong> Inspect citizen ratings and Before/After resolution evidence photos.
          </div>

          <div className="space-y-3">
            {impactMetrics.map((imp) => {
              const prob = problems.find((p) => p.id === imp.problem_id);

              return (
                <div key={imp.id} className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                      Verified Audit #{imp.id.slice(0, 8)}
                    </span>
                    <span className="text-xs font-bold text-[#E65100]">
                      ⭐ {imp.citizen_rating} / 5 Stars
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-stone-900">{prob?.title}</h3>

                  <div className="grid grid-cols-2 gap-2">
                    <img src={imp.before_photo_url} alt="before" className="h-20 w-full object-cover rounded-lg border" />
                    <img src={imp.after_photo_url} alt="after" className="h-20 w-full object-cover rounded-lg border" />
                  </div>

                  <p className="text-[11px] text-stone-600 italic bg-stone-50 p-2 rounded-lg">
                    "{imp.citizen_feedback}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
