import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateMatchScore } from '../../lib/matching';
import { Problem, Proposal, StudentMember, MatchScoreResult } from '../../types';
import {
  Sparkles,
  Award,
  Users,
  GitPullRequest,
  CheckCircle2,
  Clock,
  BookOpen,
  Plus,
  Trash2,
  Send,
  X,
  MapPin,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

interface UniversityPortalProps {
  activeSubView?: 'queue' | 'proposal' | 'milestones' | 'archive';
}

export const UniversityPortal: React.FC<UniversityPortalProps> = ({ activeSubView = 'queue' }) => {
  const {
    currentUser,
    problems,
    proposals,
    milestones,
    submitProposal,
    toggleMilestone,
    language,
    triggerHaptics,
  } = useApp();

  const [subView, setSubView] = useState<'queue' | 'proposal' | 'milestones' | 'archive'>(activeSubView);

  // Proposal Builder State
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [mentorName, setMentorName] = useState('Dr. Anand Swaroop');
  const [mentorDept, setMentorDept] = useState('Department of Environmental & Civil Engineering');
  const [mentorEmail, setMentorEmail] = useState(currentUser?.email || 'mentor@univ.ac.in');
  const [proposalDesc, setProposalDesc] = useState('');
  const [timeline, setTimeline] = useState('4 Months');
  const [budget, setBudget] = useState<number>(250000);
  const [ipAck, setIpAck] = useState(true);
  const [students, setStudents] = useState<StudentMember[]>([
    { student_name: 'Priyanka Sharma', student_roll_no: 'BTECH/ENV/22/041' },
    { student_name: 'Rahul Murmu', student_roll_no: 'BTECH/ENV/22/058' },
  ]);

  // Handle Add Student Member
  const addStudentRow = () => {
    triggerHaptics();
    setStudents((prev) => [...prev, { student_name: '', student_roll_no: '' }]);
  };

  const removeStudentRow = (index: number) => {
    triggerHaptics();
    setStudents((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStudentRow = (index: number, field: keyof StudentMember, value: string) => {
    setStudents((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const handleOpenProposal = (prob: Problem) => {
    setSelectedProblem(prob);
    setProposalDesc(`Engineering intervention to remediate ${prob.title} using localized institutional testing and field deployment.`);
    setSubView('proposal');
  };

  const handleFinalProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblem || !currentUser) return;

    submitProposal(
      {
        problem_id: selectedProblem.id,
        university_id: currentUser.id,
        university_name: currentUser.org_name || currentUser.name,
        mentor_name: mentorName.trim(),
        mentor_department: mentorDept.trim(),
        mentor_email: mentorEmail.trim(),
        description: proposalDesc.trim(),
        timeline: timeline.trim(),
        estimated_budget: Number(budget),
        ip_notice_ack: ipAck,
      },
      students.filter((s) => s.student_name.trim() !== ''),
    );

    setSelectedProblem(null);
    setSubView('milestones');
  };

  // University Assigned Problems
  const assignedProblems = problems.filter((p) => p.assigned_university_id === currentUser?.id);

  // Rejected / Archived Proposals for Lessons Learned
  const archivedProposals = proposals.filter(
    (p) => p.status === 'rejected' || p.cancellation_reason,
  );

  return (
    <div className="pb-8">
      {/* University Banner */}
      <div className="bg-[#1B5E20] text-white px-4 pt-3 pb-4 shadow-inner">
        <span className="text-[10px] font-bold tracking-wider uppercase bg-[#E65100] text-white px-2 py-0.5 rounded-full">
          {language === 'hi' ? 'विश्वविद्यालय अनुसंधान पोर्टल' : 'University Innovation Portal'}
        </span>
        <h2 className="text-base font-black mt-1">
          {currentUser?.org_name || currentUser?.name || 'Higher Technical Institute'}
        </h2>
        <div className="text-[11px] text-emerald-100 flex items-center gap-2 mt-0.5">
          <span>{currentUser?.district || 'Jharkhand'}</span>
          <span>•</span>
          <span>Domains: {currentUser?.domain_tags?.join(', ') || 'Interdisciplinary'}</span>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-1.5 mt-3 bg-black/20 p-1 rounded-xl">
          <button
            onClick={() => setSubView('queue')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              subView === 'queue' ? 'bg-white text-[#1B5E20] shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            Match Queue
          </button>
          <button
            onClick={() => setSubView('milestones')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              subView === 'milestones' ? 'bg-white text-[#1B5E20] shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            Milestones ({assignedProblems.length})
          </button>
          <button
            onClick={() => setSubView('archive')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              subView === 'archive' ? 'bg-white text-[#1B5E20] shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            Lessons Learned
          </button>
        </div>
      </div>

      {/* VIEW 1: ALGORITHMIC MATCH QUEUE */}
      {subView === 'queue' && (
        <div className="p-3.5 space-y-3">
          <div className="text-xs text-stone-600 bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-start gap-2">
            <Sparkles size={16} className="text-[#E65100] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900">Deterministic 100-Point Match Engine:</span>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-tight">
                Ranked by Domain Specialization (50pts) + District Proximity (30pts) + Lab Facilities (20pts).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {problems.map((prob) => {
              if (!currentUser) return null;
              const match = calculateMatchScore(prob, currentUser);

              return (
                <div
                  key={prob.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-[#1B5E20]/40 transition-all p-3.5 space-y-2.5"
                >
                  {/* Top Match Score Pill */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold bg-[#1B5E20]/10 text-[#1B5E20] px-2 py-0.5 rounded-full">
                        {prob.domain}
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {prob.district}, Jharkhand
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs ${
                        match.totalScore >= 70
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : match.totalScore >= 40
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      <Sparkles size={12} className="text-[#E65100]" />
                      <span>{match.totalScore} / 100 Pts Match</span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-stone-900">{prob.title}</h3>
                  <p className="text-[11px] text-stone-600 line-clamp-2">{prob.description}</p>

                  {/* Explainable Scoring Breakdown Box */}
                  <div className="bg-stone-50 p-2 rounded-xl text-[10px] text-stone-700 border border-stone-200 space-y-1 font-sans">
                    <div className="font-bold text-stone-900 flex items-center gap-1">
                      <span>Reasoning:</span>
                      <span className="text-emerald-700">{match.explanation}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[10px] text-stone-400">
                      Status: <span className="font-bold uppercase text-stone-600">{prob.status}</span>
                    </div>

                    <button
                      onClick={() => handleOpenProposal(prob)}
                      className="px-3 py-1.5 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-xs rounded-xl shadow flex items-center gap-1 transition-colors"
                    >
                      <FileCheck2 size={13} />
                      <span>Accept & Propose Solution</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: PROPOSAL & TEAM ROSTER BUILDER */}
      {subView === 'proposal' && selectedProblem && (
        <form onSubmit={handleFinalProposalSubmit} className="p-3.5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-xs font-black text-stone-900 uppercase">
                Submit Solution Proposal
              </h3>
              <button
                type="button"
                onClick={() => setSubView('queue')}
                className="text-stone-400 hover:text-stone-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-emerald-50 p-2.5 rounded-xl text-xs border border-emerald-200">
              <div className="text-[10px] uppercase font-bold text-emerald-800">Target Problem:</div>
              <div className="font-bold text-emerald-950">{selectedProblem.title}</div>
              <div className="text-[10px] text-emerald-800">{selectedProblem.district} • {selectedProblem.domain}</div>
            </div>

            {/* Faculty Mentor Details */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <Users size={14} className="text-[#1B5E20]" />
                <span>Faculty Mentor Credentials</span>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-0.5">Faculty Lead Name</label>
                <input
                  type="text"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-0.5">Department</label>
                <input
                  type="text"
                  value={mentorDept}
                  onChange={(e) => setMentorDept(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-0.5">Official Email</label>
                <input
                  type="email"
                  value={mentorEmail}
                  onChange={(e) => setMentorEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  required
                />
              </div>
            </div>

            {/* Dynamic Student Team Roster */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-stone-800 flex items-center gap-1">
                  <span>🎓</span>
                  <span>Dynamic Student Team Roster</span>
                </div>
                <button
                  type="button"
                  onClick={addStudentRow}
                  className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-[#1B5E20] rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus size={11} />
                  <span>Add Member</span>
                </button>
              </div>

              <div className="space-y-2">
                {students.map((student, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                    <input
                      type="text"
                      placeholder="Student Full Name"
                      value={student.student_name}
                      onChange={(e) => updateStudentRow(idx, 'student_name', e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Roll No"
                      value={student.student_roll_no}
                      onChange={(e) => updateStudentRow(idx, 'student_roll_no', e.target.value)}
                      className="w-28 px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white font-mono"
                      required
                    />
                    {students.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStudentRow(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Budget & Timeline */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-0.5">Budget Estimate (₹)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-stone-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-0.5">Estimated Duration</label>
                <input
                  type="text"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* IPR Policy Notice Acknowledgement */}
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ipAck}
                  onChange={(e) => setIpAck(e.target.checked)}
                  className="mt-0.5 text-[#1B5E20] focus:ring-[#1B5E20] rounded"
                  required
                />
                <span className="text-[10px] text-stone-700 leading-tight">
                  I acknowledge Government of Jharkhand Open Innovation & IPR guidelines. Developed public solutions will be made available for state community deployment.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Send size={13} />
              <span>Submit Solution Proposal & Roster</span>
            </button>
          </div>
        </form>
      )}

      {/* VIEW 3: MILESTONE PROGRESSION & STATUS TRIGGER */}
      {subView === 'milestones' && (
        <div className="p-3.5 space-y-3">
          <div className="text-xs text-stone-600 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-start gap-2">
            <GitPullRequest size={16} className="text-[#1B5E20] shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-900 leading-tight">
              Checking off project milestones automatically triggers the PostgreSQL database state machine: transitioning problems to <code>in_progress</code> or <code>completed</code>.
            </p>
          </div>

          <div className="space-y-3">
            {assignedProblems.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-2">
                <Clock size={28} className="mx-auto text-stone-300" />
                <div className="text-xs font-bold text-stone-700">No Projects Currently Assigned</div>
                <p className="text-[11px] text-stone-500">
                  Select a challenge from the Match Queue to submit a proposal.
                </p>
                <button
                  onClick={() => setSubView('queue')}
                  className="mt-2 px-3 py-1.5 bg-[#1B5E20] text-white text-xs font-bold rounded-xl shadow"
                >
                  Browse Match Queue
                </button>
              </div>
            ) : (
              assignedProblems.map((prob) => {
                const probMilestones = milestones.filter((m) => m.problem_id === prob.id);
                const completedCount = probMilestones.filter((m) => m.status === 'completed').length;
                const progressPct =
                  probMilestones.length === 0 ? 0 : Math.round((completedCount / probMilestones.length) * 100);

                return (
                  <div key={prob.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#1B5E20] uppercase">{prob.domain}</span>
                        <h3 className="text-xs font-bold text-stone-900">{prob.title}</h3>
                        <div className="text-[10px] text-stone-500">{prob.district}, Jharkhand</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          prob.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {prob.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-stone-600 mb-1">
                        <span>Milestone Progress</span>
                        <span>{progressPct}% Completed</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#1B5E20] h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Milestones Checkoff List */}
                    <div className="space-y-1.5 pt-1">
                      {probMilestones.map((m) => (
                        <label
                          key={m.id}
                          className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                            m.status === 'completed'
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={m.status === 'completed'}
                            onChange={() => toggleMilestone(m.id)}
                            className="mt-0.5 text-[#1B5E20] focus:ring-[#1B5E20] rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <span className={m.status === 'completed' ? 'line-through opacity-80' : 'font-medium'}>
                              {m.title}
                            </span>
                            {m.completed_at && (
                              <div className="text-[9px] text-emerald-700 mt-0.5">
                                Completed: {new Date(m.completed_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: LESSONS LEARNED ARCHIVE */}
      {subView === 'archive' && (
        <div className="p-3.5 space-y-3">
          <div className="text-xs text-stone-600 bg-stone-100 border border-stone-200 p-2.5 rounded-xl flex items-start gap-2">
            <BookOpen size={16} className="text-stone-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900">Institutional Lessons Learned Archive:</span>
              <p className="text-[11px] text-stone-600 mt-0.5 leading-tight">
                Rejected or cancelled proposals are documented with structural reasons to prevent repeated mistakes in rural field execution.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {archivedProposals.map((prop) => (
              <div key={prop.id} className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded uppercase">
                    Archived / Rejected
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {new Date(prop.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-stone-900">{prop.description}</h4>
                <div className="text-[10px] text-stone-500">
                  Lead: {prop.mentor_name} ({prop.university_name})
                </div>

                {prop.cancellation_reason && (
                  <div className="bg-rose-50 border border-rose-200 p-2 rounded-xl text-[11px] text-rose-900 leading-relaxed">
                    <strong>Critical Lesson:</strong> {prop.cancellation_reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
