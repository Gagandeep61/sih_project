import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Proposal, IndustryInterest } from '../../types';
import { DOMAINS, JHARKHAND_DISTRICTS } from '../../constants';
import {
  Briefcase,
  HeartHandshake,
  Award,
  DollarSign,
  Building2,
  Users,
  CheckCircle2,
  Filter,
  Search,
  Sparkles,
  ChevronRight,
  Send,
  X,
  Star,
} from 'lucide-react';

interface IndustryPortalProps {
  activeSubView?: 'proposals' | 'pledge' | 'proofs';
}

export const IndustryPortal: React.FC<IndustryPortalProps> = ({ activeSubView = 'proposals' }) => {
  const {
    currentUser,
    proposals,
    problems,
    industryInterests,
    expressIndustryInterest,
    impactMetrics,
    language,
    triggerHaptics,
  } = useApp();

  const [subView, setSubView] = useState<'proposals' | 'pledge' | 'proofs'>(activeSubView);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Filter state
  const [domainFilter, setDomainFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');

  // Pledge modal form state
  const [pledgeType, setPledgeType] = useState<'funding' | 'mentorship' | 'both'>('both');
  const [fundingAmount, setFundingAmount] = useState<number>(250000);
  const [pledgeMessage, setPledgeMessage] = useState('');

  const handleOpenPledge = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setFundingAmount(proposal.estimated_budget || 200000);
    setPledgeMessage(
      `${currentUser?.org_name || currentUser?.name} commits to supporting this student-led innovation under our corporate CSR mandate.`,
    );
  };

  const handleSubmitPledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposal || !currentUser) return;

    expressIndustryInterest({
      proposal_id: selectedProposal.id,
      industry_id: currentUser.id,
      industry_name: currentUser.org_name || currentUser.name,
      interest_type: pledgeType,
      funding_amount: pledgeType === 'mentorship' ? 0 : Number(fundingAmount),
      message: pledgeMessage.trim(),
    });

    setSelectedProposal(null);
    setSubView('pledge');
  };

  // My Pledged Commitments
  const myPledges = industryInterests.filter((i) => i.industry_id === currentUser?.id);
  const totalPledged = myPledges.reduce((sum, p) => sum + (p.funding_amount || 0), 0);

  // Active proposals that can be funded
  const availableProposals = proposals.filter((p) => p.status !== 'rejected');

  return (
    <div className="pb-8">
      {/* Industry Header */}
      <div className="bg-[#1B5E20] text-white px-4 pt-3 pb-4 shadow-inner">
        <span className="text-[10px] font-bold tracking-wider uppercase bg-[#E65100] text-white px-2 py-0.5 rounded-full">
          {language === 'hi' ? 'उद्योग व कॉर्पोरेट सीएसआर' : 'Industry & Corporate CSR Portal'}
        </span>
        <h2 className="text-base font-black mt-1">
          {currentUser?.org_name || currentUser?.name || 'Corporate Partner'}
        </h2>
        <p className="text-[11px] text-emerald-100">
          Section 135 Companies Act CSR Synergy with Higher Technical Education
        </p>

        {/* Sub navigation */}
        <div className="flex items-center gap-1.5 mt-3 bg-black/20 p-1 rounded-xl">
          <button
            onClick={() => setSubView('proposals')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              subView === 'proposals' ? 'bg-white text-[#1B5E20] shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            Proposals ({availableProposals.length})
          </button>
          <button
            onClick={() => setSubView('pledge')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              subView === 'pledge' ? 'bg-white text-[#1B5E20] shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            My Pledges ({myPledges.length})
          </button>
          <button
            onClick={() => setSubView('proofs')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              subView === 'proofs' ? 'bg-white text-[#1B5E20] shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            Resolution Proofs
          </button>
        </div>
      </div>

      {/* VIEW 1: BROWSE PROPOSALS */}
      {subView === 'proposals' && (
        <div className="p-3.5 space-y-3">
          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-700 outline-none shrink-0"
            >
              <option value="All">All CSR Verticals</option>
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {availableProposals.map((prop) => {
              const matchedProblem = problems.find((p) => p.id === prop.problem_id);

              return (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-[#1B5E20]/40 transition-all p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Building2 size={11} />
                      <span>{prop.university_name}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1B5E20]">
                      ₹{prop.estimated_budget.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-stone-900">
                    {matchedProblem ? matchedProblem.title : 'University Solution Proposal'}
                  </h3>

                  <p className="text-[11px] text-stone-600 line-clamp-2">{prop.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                    <span>Mentor: {prop.mentor_name}</span>
                    <span className="font-semibold text-stone-700">Timeline: {prop.timeline}</span>
                  </div>

                  <button
                    onClick={() => handleOpenPledge(prop)}
                    className="w-full py-2 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <HeartHandshake size={14} />
                    <span>Pledge CSR Capital / Mentorship</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: MY PLEDGED COMMITMENTS */}
      {subView === 'pledge' && (
        <div className="p-3.5 space-y-3">
          {/* CSR Impact Summary Card */}
          <div className="bg-gradient-to-br from-[#1B5E20] to-[#144718] text-white p-4 rounded-2xl shadow-md space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              Total CSR Capital Committed
            </span>
            <div className="text-2xl font-black font-mono">₹{totalPledged.toLocaleString()}</div>
            <p className="text-[11px] text-emerald-100">
              Deployed across {myPledges.length} vetted university societal innovation testbeds.
            </p>
          </div>

          <div className="space-y-2.5">
            {myPledges.map((pledge) => {
              const matchedProp = proposals.find((p) => p.id === pledge.proposal_id);

              return (
                <div key={pledge.id} className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                      {pledge.interest_type.toUpperCase()} PLEDGED
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1B5E20]">
                      {pledge.funding_amount > 0 ? `₹${pledge.funding_amount.toLocaleString()}` : 'Mentorship'}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-stone-900">
                    {matchedProp?.university_name || 'Academic Institution Partner'}
                  </div>

                  <p className="text-[11px] text-stone-600 italic">"{pledge.message}"</p>

                  <div className="text-[10px] text-stone-400 font-mono">
                    Committed on: {new Date(pledge.created_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: RESOLUTION PROOFS (Before / After Photos & Cost Avoided) */}
      {subView === 'proofs' && (
        <div className="p-3.5 space-y-3">
          <div className="text-xs text-stone-600 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
            <strong>Audited Community Impact:</strong> Side-by-side Before/After verification photos and citizen satisfaction metrics.
          </div>

          <div className="space-y-3">
            {impactMetrics.map((imp) => {
              const prob = problems.find((p) => p.id === imp.problem_id);

              return (
                <div key={imp.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#1B5E20] bg-emerald-100 px-2 py-0.5 rounded-full">
                      Verified Resolution
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(imp.citizen_rating || 5)].map((_, i) => (
                        <Star key={i} size={13} className="fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-stone-900">{prob?.title || 'Community Solution'}</h3>

                  {/* Before / After Photo Comparison */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-rose-700 uppercase bg-rose-50 px-1.5 py-0.2 rounded">
                        Before (Issue)
                      </span>
                      <div className="h-24 rounded-lg overflow-hidden border border-stone-200">
                        <img src={imp.before_photo_url} alt="before" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.2 rounded">
                        After (Solved)
                      </span>
                      <div className="h-24 rounded-lg overflow-hidden border border-stone-200">
                        <img src={imp.after_photo_url} alt="after" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center bg-stone-50 p-2 rounded-xl text-xs">
                    <div>
                      <div className="text-[10px] text-stone-500">People Benefited</div>
                      <div className="font-bold text-stone-900 font-mono">
                        {imp.people_benefited.toLocaleString()}+
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500">Public Cost Saved</div>
                      <div className="font-bold text-[#1B5E20] font-mono">
                        ₹{imp.cost_saved.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-200/50">
                    "{imp.citizen_feedback}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CSR PLEDGE MODAL */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitPledge}
            className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <HeartHandshake size={16} className="text-[#E65100]" />
                <span>Pledge Corporate CSR Grant</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-stone-50 p-2 rounded-xl text-xs">
              <div className="font-bold text-stone-800">{selectedProposal.university_name}</div>
              <div className="text-[10px] text-stone-500">Est. Budget: ₹{selectedProposal.estimated_budget.toLocaleString()}</div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">Support Vertical</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['funding', 'mentorship', 'both'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPledgeType(t)}
                    className={`py-1.5 text-xs font-bold rounded-lg border capitalize ${
                      pledgeType === t
                        ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {pledgeType !== 'mentorship' && (
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                  Funding Amount (₹)
                </label>
                <input
                  type="number"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Pledge Message / Scope</label>
              <textarea
                rows={2}
                value={pledgeMessage}
                onChange={(e) => setPledgeMessage(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1B5E20] outline-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <Send size={13} />
              <span>Confirm CSR Capital Pledge</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
