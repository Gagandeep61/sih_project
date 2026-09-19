import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_PROFILES, JHARKHAND_DISTRICTS, DOMAINS } from '../../constants';
import { UserProfile, UserRole, DomainCategory } from '../../types';
import {
  X,
  UserCheck,
  Building2,
  Factory,
  ShieldAlert,
  Key,
  Fingerprint,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Lock,
  Mail,
  Phone,
  MapPin,
  HelpCircle,
} from 'lucide-react';

interface LocalAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalAuthModal: React.FC<LocalAuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, quickLoginAs, logout, registerUser, accessCodes } = useApp();
  const [authTab, setAuthTab] = useState<'quick' | 'signup' | 'login'>('quick');

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('citizen');
  const [regOrg, setRegOrg] = useState('');
  const [regDistrict, setRegDistrict] = useState('Ranchi');
  const [regAccessCode, setRegAccessCode] = useState('');
  const [regDomain, setRegDomain] = useState<DomainCategory>('Water Management');
  const [regError, setRegError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  if (!isOpen) return null;

  const handleQuickSelect = (profile: UserProfile) => {
    quickLoginAs(profile);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Please enter your name and email address');
      return;
    }

    const res = registerUser(
      {
        name: regName.trim(),
        email: regEmail.trim(),
        role: regRole,
        org_name: regOrg.trim() || undefined,
        district: regDistrict,
        domain_tags: [regDomain],
      },
      regAccessCode.trim(),
    );

    if (!res.success) {
      setRegError(res.message);
    } else {
      onClose();
    }
  };

  const handleLocalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const matched = DEMO_PROFILES.find(
      (p) => p.email.toLowerCase() === loginEmail.trim().toLowerCase(),
    );

    if (matched) {
      quickLoginAs(matched);
      onClose();
    } else if (loginEmail.includes('@')) {
      // Create ad-hoc citizen account for local auth
      const adHoc: UserProfile = {
        id: `usr-${Date.now()}`,
        name: loginEmail.split('@')[0],
        email: loginEmail.trim(),
        role: 'citizen',
        district: 'Ranchi',
      };
      quickLoginAs(adHoc);
      onClose();
    } else {
      setLoginError('Invalid credentials. Select an account from 1-Click Demo Logins.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header */}
        <div className="bg-[#1B5E20] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Key size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">Local Authentication & Accounts</h2>
              <p className="text-[11px] text-emerald-100">Zero-latency local session for hackathon evaluation</p>
            </div>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-3 pt-2">
          <button
            id="auth-tab-quick"
            onClick={() => setAuthTab('quick')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition-colors ${
              authTab === 'quick'
                ? 'border-[#1B5E20] text-[#1B5E20] bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            1-Click Demo (12 Accounts)
          </button>
          <button
            id="auth-tab-signup"
            onClick={() => setAuthTab('signup')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition-colors ${
              authTab === 'signup'
                ? 'border-[#1B5E20] text-[#1B5E20] bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            New Registration
          </button>
          <button
            id="auth-tab-login"
            onClick={() => setAuthTab('login')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition-colors ${
              authTab === 'login'
                ? 'border-[#1B5E20] text-[#1B5E20] bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Email / PIN
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Current Logged in User Bar */}
          {currentUser && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B5E20] text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 truncate max-w-[200px]">
                    {currentUser.email} • {currentUser.district || 'Ranchi'}
                  </div>
                </div>
              </div>
              <button
                id="logout-btn"
                onClick={logout}
                className="text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* TAB 1: 1-CLICK DEMO EVALUATION ACCOUNTS */}
          {authTab === 'quick' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-600 leading-relaxed bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-start gap-2">
                <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Tap any of the <strong>12 pre-seeded institutional accounts</strong> below to instantly test their
                  portal with full permissions without typing credentials.
                </span>
              </div>

              {/* STATE ADMIN */}
              <div>
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ShieldAlert size={13} className="text-amber-600" />
                  <span>State Government Administrator</span>
                </div>
                {DEMO_PROFILES.filter((p) => p.role === 'admin').map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleQuickSelect(profile)}
                    className="w-full text-left p-2.5 rounded-xl border border-stone-200 hover:border-[#1B5E20] bg-white hover:bg-emerald-50/50 transition-all flex items-center justify-between group shadow-xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <span>👑 {profile.name}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">{profile.email}</div>
                    </div>
                    <ChevronRight size={16} className="text-stone-400 group-hover:text-[#1B5E20]" />
                  </button>
                ))}
              </div>

              {/* CITIZEN */}
              <div>
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <UserCheck size={13} className="text-sky-600" />
                  <span>Citizen (Public Grievance Reporter)</span>
                </div>
                {DEMO_PROFILES.filter((p) => p.role === 'citizen').map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleQuickSelect(profile)}
                    className="w-full text-left p-2.5 rounded-xl border border-stone-200 hover:border-[#1B5E20] bg-white hover:bg-emerald-50/50 transition-all flex items-center justify-between group shadow-xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <span>👤 {profile.name}</span>
                        <span className="text-[10px] text-stone-500 font-normal">({profile.district})</span>
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">{profile.email}</div>
                    </div>
                    <ChevronRight size={16} className="text-stone-400 group-hover:text-[#1B5E20]" />
                  </button>
                ))}
              </div>

              {/* 5 UNIVERSITIES */}
              <div>
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Building2 size={13} className="text-indigo-600" />
                  <span>5 Universities (Engineering Innovation Units)</span>
                </div>
                <div className="space-y-1.5">
                  {DEMO_PROFILES.filter((p) => p.role === 'university').map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => handleQuickSelect(profile)}
                      className="w-full text-left p-2.5 rounded-xl border border-stone-200 hover:border-[#1B5E20] bg-white hover:bg-emerald-50/50 transition-all flex items-center justify-between group shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-stone-900 truncate">
                          🎓 {profile.name}
                        </div>
                        <div className="text-[10px] text-stone-500 truncate">
                          {profile.district} • {profile.domain_tags?.join(', ')}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-stone-400 group-hover:text-[#1B5E20] shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 5 INDUSTRIES */}
              <div>
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Factory size={13} className="text-amber-700" />
                  <span>5 Industries (Corporate CSR Partners)</span>
                </div>
                <div className="space-y-1.5">
                  {DEMO_PROFILES.filter((p) => p.role === 'industry').map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => handleQuickSelect(profile)}
                      className="w-full text-left p-2.5 rounded-xl border border-stone-200 hover:border-[#1B5E20] bg-white hover:bg-emerald-50/50 transition-all flex items-center justify-between group shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-stone-900 truncate">
                          🏭 {profile.name}
                        </div>
                        <div className="text-[10px] text-stone-500 truncate">
                          CSR Focus: {profile.domain_tags?.join(', ')}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-stone-400 group-hover:text-[#1B5E20] shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEW USER REGISTRATION */}
          {authTab === 'signup' && (
            <form onSubmit={handleRegister} className="space-y-3">
              {regError && (
                <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs p-2.5 rounded-lg">
                  {regError}
                </div>
              )}

              {/* Role Picker */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Select Role</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('citizen')}
                    className={`p-2 text-xs rounded-xl border font-bold flex flex-col items-center gap-1 ${
                      regRole === 'citizen'
                        ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    <UserCheck size={16} />
                    <span>Citizen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('university')}
                    className={`p-2 text-xs rounded-xl border font-bold flex flex-col items-center gap-1 ${
                      regRole === 'university'
                        ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    <Building2 size={16} />
                    <span>University</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('industry')}
                    className={`p-2 text-xs rounded-xl border font-bold flex flex-col items-center gap-1 ${
                      regRole === 'industry'
                        ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    <Factory size={16} />
                    <span>Industry</span>
                  </button>
                </div>
              </div>

              {/* Institutional Access Code Requirement */}
              {(regRole === 'university' || regRole === 'industry') && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
                  <label className="block text-xs font-bold text-amber-900">
                    Gov Access Code (PREFIX-JH-####) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={regAccessCode}
                    onChange={(e) => setRegAccessCode(e.target.value.toUpperCase())}
                    placeholder={regRole === 'university' ? 'e.g. UNIV-JH-8821' : 'e.g. IND-JH-9132'}
                    className="w-full px-3 py-1.5 text-xs font-mono tracking-wider uppercase border border-amber-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1B5E20] outline-none"
                    required
                  />
                  <div className="text-[10px] text-amber-800">
                    <strong>Pre-generated test codes:</strong>{' '}
                    {regRole === 'university' ? 'UNIV-JH-8821 or UNIV-JH-4409' : 'IND-JH-9132'}
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {regRole === 'citizen' ? 'Full Name' : 'Institution / Company Name'}
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder={regRole === 'citizen' ? 'e.g. Sunita Soren' : 'e.g. Kolhan University'}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@domain.gov.in"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  required
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">District of Jharkhand</label>
                <select
                  value={regDistrict}
                  onChange={(e) => setRegDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1B5E20] outline-none"
                >
                  {JHARKHAND_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Domain */}
              {regRole !== 'citizen' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Primary Domain Specialization</label>
                  <select
                    value={regDomain}
                    onChange={(e) => setRegDomain(e.target.value as DomainCategory)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  >
                    {DOMAINS.map((dom) => (
                      <option key={dom} value={dom}>
                        {dom}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                id="submit-register-btn"
                className="w-full bg-[#1B5E20] hover:bg-[#154a19] text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors mt-2"
              >
                Complete Local Registration
              </button>
            </form>
          )}

          {/* TAB 3: STANDARD LOGIN */}
          {authTab === 'login' && (
            <form onSubmit={handleLocalLogin} className="space-y-3">
              {loginError && (
                <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs p-2.5 rounded-lg">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email / Mobile Number</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin.jharkhand@gov.in or ramesh.citizen@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1B5E20] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Passcode / PIN</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-3 text-stone-400" />
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                <span>Local biometric bypass supported</span>
                <span className="text-[#1B5E20] font-medium">Demo Mode</span>
              </div>

              <button
                type="submit"
                id="submit-login-btn"
                className="w-full bg-[#1B5E20] hover:bg-[#154a19] text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors"
              >
                Sign In to Local Session
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect(DEMO_PROFILES[0])}
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 py-2 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Fingerprint size={15} />
                <span>Simulate Biometric Auth as State Admin</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
