import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { JHARKHAND_DISTRICTS, DOMAINS, DPDP_CONSENT_STATEMENT } from '../../constants';
import { DomainCategory, Problem } from '../../types';
import { findPotentialDuplicates } from '../../lib/duplicateDetector';
import { uploadEvidencePhoto } from '../../lib/supabase';
import {
  Search,
  Filter,
  MapPin,
  Camera,
  ThumbsUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Star,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Info,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';

interface CitizenPortalProps {
  activeSubView?: 'explore' | 'report' | 'my-reports';
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ activeSubView = 'explore' }) => {
  const {
    currentUser,
    problems,
    submitProblem,
    toggleProblemSupport,
    supportedProblemIds,
    submitCitizenRating,
    impactMetrics,
    language,
    triggerHaptics,
  } = useApp();

  const [view, setView] = useState<'explore' | 'report' | 'my-reports'>(activeSubView);

  // Sync prop changes
  useEffect(() => {
    setView(activeSubView);
  }, [activeSubView]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');

  // 4-Step Report Wizard State
  const [step, setStep] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState<DomainCategory>('Water Management');
  const [district, setDistrict] = useState('Ranchi');
  const [landmark, setLandmark] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [locationSource, setLocationSource] = useState<'auto' | 'manual'>('manual');
  const [gpsStatus, setGpsStatus] = useState<'capturing' | 'captured' | 'failed' | 'idle'>('idle');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitterType, setSubmitterType] = useState('Citizen');
  const [submitting, setSubmitting] = useState(false);

  // Citizen Rating Modal State
  const [ratingProblem, setRatingProblem] = useState<Problem | null>(null);
  const [starCount, setStarCount] = useState<number>(5);
  const [ratingFeedback, setRatingFeedback] = useState<string>('');

  // Silent Background GPS Geolocation Capture (Compliant with DPDP Act 2023)
  useEffect(() => {
    if (view === 'report' && 'geolocation' in navigator && gpsStatus === 'idle') {
      setGpsStatus('capturing');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setLocationSource('auto');
          setGpsStatus('captured');
        },
        (error) => {
          // Silent fallback to district center coordinates
          setLat(23.3441);
          setLng(85.3096);
          setLocationSource('manual');
          setGpsStatus('failed');
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
      );
    }
  }, [view, gpsStatus]);

  // Real-time Duplicate Detection
  const duplicateAlerts = findPotentialDuplicates(title, district, problems);

  // Handle Photo Selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    triggerHaptics();

    // Try Supabase Storage upload
    const uploadRes = await uploadEvidencePhoto(file, file.name);
    if (uploadRes.url) {
      setPhotoUrls((prev) => [uploadRes.url!, ...prev]);
      setUploadingPhoto(false);
      return;
    }

    // Fallback to local FileReader base64 preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoUrls((prev) => [event.target!.result as string, ...prev]);
      }
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      alert('Statutory consent under DPDP Act 2023 is required before submitting.');
      return;
    }
    setSubmitting(true);

    const photos =
      photoUrls.length > 0
        ? photoUrls
        : ['https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'];

    await submitProblem({
      title: title.trim(),
      description: `${description.trim()} ${landmark ? `(Landmark: ${landmark})` : ''}`,
      domain,
      district,
      lat,
      lng,
      location_source: locationSource,
      photo_urls: photos,
      submitted_by_type: submitterType,
    });

    setSubmitting(false);
    // Reset form
    setTitle('');
    setDescription('');
    setLandmark('');
    setPhotoUrls([]);
    setStep(1);
    setView('explore');
  };

  // Filter problems
  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDistrict = selectedDistrict === 'All' || p.district === selectedDistrict;
    const matchesDomain = selectedDomain === 'All' || p.domain === selectedDomain;

    return matchesSearch && matchesDistrict && matchesDomain;
  });

  const myProblems = problems.filter((p) => p.submitted_by === currentUser?.id);

  return (
    <div className="pb-8">
      {/* Citizen Portal Hero Bar */}
      <div className="bg-[#1B5E20] text-white px-4 pt-3 pb-4 shadow-inner">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-[#E65100] text-white px-2 py-0.5 rounded-full">
              {language === 'hi' ? 'नागरिक पोर्टल' : 'Citizen Grievance & Innovation Portal'}
            </span>
            <h2 className="text-base font-black mt-1">
              {language === 'hi' ? 'जनसमस्या समाधान मंच' : 'Transforming Public Issues into Solutions'}
            </h2>
            <p className="text-[11px] text-emerald-100">
              {language === 'hi'
                ? 'आपकी समस्या का निवारण झारखण्ड के विश्वविद्यालय करेंगे'
                : 'Directly allocated to Jharkhand Engineering Universities for resolution'}
            </p>
          </div>
        </div>

        {/* Inner Sub-navigation Pills */}
        <div className="flex items-center gap-1.5 mt-3 bg-black/20 p-1 rounded-xl">
          <button
            id="subview-explore-btn"
            onClick={() => {
              triggerHaptics();
              setView('explore');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              view === 'explore' ? 'bg-white text-[#1B5E20] shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            {language === 'hi' ? 'सभी मुद्दे' : 'Public Feed'} ({problems.length})
          </button>
          <button
            id="subview-report-btn"
            onClick={() => {
              triggerHaptics();
              setView('report');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              view === 'report' ? 'bg-[#E65100] text-white shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            <span>+</span>
            <span>{language === 'hi' ? 'नयी शिकायत' : 'Report Issue'}</span>
          </button>
          <button
            id="subview-my-reports-btn"
            onClick={() => {
              triggerHaptics();
              setView('my-reports');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              view === 'my-reports' ? 'bg-white text-[#1B5E20] shadow' : 'text-white/80 hover:text-white'
            }`}
          >
            {language === 'hi' ? 'मेरी शिकायतें' : 'My Issues'} ({myProblems.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: PUBLIC COMMUNITY FEED */}
      {view === 'explore' && (
        <div className="p-3.5 space-y-3">
          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword, district, or domain..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white shadow-xs focus:ring-2 focus:ring-[#1B5E20] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-700 outline-none shrink-0"
              >
                <option value="All">All 24 Districts</option>
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-700 outline-none shrink-0"
              >
                <option value="All">All Domains</option>
                {DOMAINS.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Issue Cards */}
          <div className="space-y-3">
            {filteredProblems.map((prob) => {
              const isSupported = supportedProblemIds.includes(prob.id);
              const isResolved = prob.status === 'completed';

              return (
                <div
                  key={prob.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-[#1B5E20]/40 transition-all group"
                >
                  {/* Photo Banner if exists */}
                  {prob.photo_urls && prob.photo_urls.length > 0 && (
                    <div className="h-32 w-full relative overflow-hidden bg-stone-100">
                      <img
                        src={prob.photo_urls[0]}
                        alt={prob.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                      {/* Status Badge */}
                      <span
                        className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider text-white shadow ${
                          prob.status === 'completed'
                            ? 'bg-[#1B5E20]'
                            : prob.status === 'in_progress'
                            ? 'bg-[#E65100]'
                            : prob.status === 'assigned'
                            ? 'bg-sky-600'
                            : prob.status === 'testing'
                            ? 'bg-purple-600'
                            : 'bg-stone-700'
                        }`}
                      >
                        {prob.status === 'completed'
                          ? '✓ Solved on Ground'
                          : prob.status === 'in_progress'
                          ? '⚙ Solution Underway'
                          : prob.status === 'assigned'
                          ? '🎓 Assigned to Univ'
                          : prob.status === 'testing'
                          ? '🧪 Pilot Testing'
                          : '⏳ In Queue'}
                      </span>

                      {/* Domain Tag */}
                      <span className="absolute bottom-2 left-2.5 text-[10px] bg-white/95 text-stone-900 font-bold px-2 py-0.5 rounded shadow">
                        {prob.domain}
                      </span>
                    </div>
                  )}

                  <div className="p-3.5 space-y-2">
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-stone-900 leading-snug flex-1">{prob.title}</h3>
                    </div>

                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      {prob.description}
                    </p>

                    {/* Location & Assigned Metadata */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                      <div className="flex items-center gap-1 font-medium text-stone-700">
                        <MapPin size={11} className="text-[#E65100]" />
                        <span>{prob.district}, Jharkhand</span>
                      </div>

                      {prob.assigned_university_name && (
                        <div className="flex items-center gap-1 text-emerald-800 font-medium">
                          <span>🎓</span>
                          <span>{prob.assigned_university_name}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions: +1 Support Upvote & Rating Button */}
                    <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                      <div className="text-[10px] text-stone-400">
                        ID: #{prob.id.slice(0, 8)}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* 1-Vote-Per-Citizen Upvote Button */}
                        <button
                          id={`upvote-btn-${prob.id.slice(0, 8)}`}
                          onClick={() => toggleProblemSupport(prob.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                            isSupported
                              ? 'bg-[#1B5E20] text-white'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                          title="1-vote-per-citizen: Upvote to increase district allocation priority"
                        >
                          <ThumbsUp size={12} className={isSupported ? 'fill-white' : ''} />
                          <span>{prob.support_count} Upvotes</span>
                        </button>

                        {/* If resolved, show Citizen Rating trigger */}
                        {isResolved && (
                          <button
                            id={`rate-resolution-btn-${prob.id.slice(0, 8)}`}
                            onClick={() => setRatingProblem(prob)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
                          >
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                            <span>Verify & Rate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: 4-STEP PROBLEM SUBMISSION WIZARD */}
      {view === 'report' && (
        <div className="p-3.5 space-y-4">
          {/* Step Indicator */}
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Step {step} of 4: {step === 1 ? 'Problem Detail' : step === 2 ? 'District Location' : step === 3 ? 'Evidence Photo' : 'Statutory Consent'}
              </span>
              <span className="text-xs font-bold text-[#1B5E20]">{step * 25}%</span>
            </div>
            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#1B5E20] h-full transition-all duration-300 rounded-full"
                style={{ width: `${step * 25}%` }}
              ></div>
            </div>
          </div>

          {/* STEP 1: TITLE & DOMAIN */}
          {step === 1 && (
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3.5 animate-in fade-in duration-200">
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#1B5E20] text-white flex items-center justify-center text-[10px]">1</span>
                <span>Challenge Title & Domain</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Issue Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Arsenic contamination in deep tube-wells of Namkum"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#1B5E20] outline-none"
                  required
                />
              </div>

              {/* Real-Time Duplicate Detection Alert Banner */}
              {duplicateAlerts.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
                    <AlertTriangle size={15} className="text-[#E65100]" />
                    <span>Potential Duplicate Found in {district}!</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-tight">
                    An identical societal challenge was already reported. Rather than creating duplicate entries, you can support this existing issue:
                  </p>
                  <div className="bg-white p-2 rounded-lg border border-amber-200 text-xs flex items-center justify-between">
                    <span className="font-semibold text-stone-800 truncate flex-1 mr-2">
                      {duplicateAlerts[0].problem.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleProblemSupport(duplicateAlerts[0].problem.id)}
                      className="px-2.5 py-1 bg-[#1B5E20] text-white font-bold rounded text-[11px] shrink-0 flex items-center gap-1 shadow-xs"
                    >
                      <ThumbsUp size={11} />
                      <span>+1 Support</span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Domain Vertical</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as DomainCategory)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-[#1B5E20] outline-none"
                >
                  {DOMAINS.map((dom) => (
                    <option key={dom} value={dom}>
                      {dom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the societal problem, people affected, duration, and past attempts at fixing..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#1B5E20] outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!title.trim()}
                  onClick={() => {
                    triggerHaptics();
                    setStep(2);
                  }}
                  className="px-4 py-2 bg-[#1B5E20] text-white font-bold text-xs rounded-xl shadow disabled:opacity-40 flex items-center gap-1"
                >
                  <span>Next: Location</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SILENT GPS & 24 DISTRICT SELECTOR */}
          {step === 2 && (
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3.5 animate-in fade-in duration-200">
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#1B5E20] text-white flex items-center justify-center text-[10px]">2</span>
                <span>District & Geolocation</span>
              </h3>

              {/* Silent GPS indicator */}
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#1B5E20]" />
                  <div>
                    <span className="font-bold text-[#1B5E20]">Silent Background GPS</span>
                    <div className="text-[10px] text-stone-600 font-mono">
                      {lat && lng ? `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (Encrypted)` : 'Acquiring GPS fix...'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                  {locationSource === 'auto' ? 'Auto GPS' : 'District Center'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Select District of Jharkhand (24 Districts)
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-[#1B5E20] outline-none"
                >
                  {JHARKHAND_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Block / Panchayat / Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Namkum Primary Health Centre, Village Tetri"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#1B5E20] outline-none"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2 border border-stone-300 text-stone-700 font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptics();
                    setStep(3);
                  }}
                  className="px-4 py-2 bg-[#1B5E20] text-white font-bold text-xs rounded-xl shadow flex items-center gap-1"
                >
                  <span>Next: Photo Evidence</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: EVIDENCE PHOTOGRAPH */}
          {step === 3 && (
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3.5 animate-in fade-in duration-200">
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#1B5E20] text-white flex items-center justify-center text-[10px]">3</span>
                <span>Photo Evidence Upload</span>
              </h3>
              <p className="text-[11px] text-stone-500 leading-tight">
                Uploaded to Supabase Storage bucket <code>problem-evidence</code> to substantiate university R&D.
              </p>

              {/* Upload Trigger Area */}
              <label className="border-2 border-dashed border-stone-300 hover:border-[#1B5E20] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-stone-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#1B5E20]/10 text-[#1B5E20] flex items-center justify-center">
                  <Camera size={20} />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-[#1B5E20]">Tap to Capture or Upload Photo</span>
                  <span className="block text-[10px] text-stone-400">JPG, PNG (Max 5MB)</span>
                </div>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />
              </label>

              {/* Upload Preview */}
              {photoUrls.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-stone-600 uppercase">Attached Evidence</span>
                  <div className="grid grid-cols-2 gap-2">
                    {photoUrls.map((url, idx) => (
                      <div key={idx} className="relative h-24 rounded-xl overflow-hidden border border-stone-200">
                        <img src={url} alt="evidence" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoUrls((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3.5 py-2 border border-stone-300 text-stone-700 font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptics();
                    setStep(4);
                  }}
                  className="px-4 py-2 bg-[#1B5E20] text-white font-bold text-xs rounded-xl shadow flex items-center gap-1"
                >
                  <span>Next: Consent</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: DPDP ACT 2023 STATUTORY CONSENT */}
          {step === 4 && (
            <form onSubmit={handleFinalSubmit} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3.5 animate-in fade-in duration-200">
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#1B5E20] text-white flex items-center justify-center text-[10px]">4</span>
                <span>Statutory Compliance & Review</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Submitting Entity Category</label>
                <select
                  value={submitterType}
                  onChange={(e) => setSubmitterType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-[#1B5E20] outline-none"
                >
                  <option value="Citizen">Citizen Individual</option>
                  <option value="Community Organization">Community Organization / NGO</option>
                  <option value="PRI">Panchayati Raj Institution (PRI)</option>
                  <option value="ULB">Urban Local Body (ULB)</option>
                  <option value="Government Department">Government Field Officer</option>
                </select>
              </div>

              {/* DPDP Act 2023 Disclosure Box */}
              <div className="bg-emerald-50/70 border border-emerald-300 p-3 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#1B5E20] font-bold">
                  <ShieldCheck size={16} />
                  <span>Digital Personal Data Protection Act, 2023 (DPDP)</span>
                </div>
                <p className="text-[11px] text-stone-700 leading-relaxed">{DPDP_CONSENT_STATEMENT}</p>
                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 text-[#1B5E20] focus:ring-[#1B5E20] rounded"
                    required
                  />
                  <span className="text-[11px] font-bold text-[#1B5E20]">
                    I grant statutory consent under DPDP Act 2023 for problem resolution.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-3.5 py-2 border border-stone-300 text-stone-700 font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={!consentGiven || submitting}
                  className="px-5 py-2 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{submitting ? 'Transmitting...' : 'Submit Challenge'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* VIEW 3: MY SUBMITTED ISSUES & STATUS TRACKER */}
      {view === 'my-reports' && (
        <div className="p-3.5 space-y-3">
          <div className="text-xs font-bold text-stone-700 flex items-center justify-between">
            <span>My Submitted Grievances</span>
            <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-mono text-[10px]">
              {myProblems.length} Registered
            </span>
          </div>

          {myProblems.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-2">
              <Clock size={28} className="mx-auto text-stone-300" />
              <div className="text-xs font-bold text-stone-700">No Challenges Reported Yet</div>
              <p className="text-[11px] text-stone-500">
                You can report societal problems in water, roads, electricity, or sanitation.
              </p>
              <button
                onClick={() => setView('report')}
                className="mt-2 px-3 py-1.5 bg-[#1B5E20] text-white text-xs font-bold rounded-xl shadow"
              >
                Report New Problem
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myProblems.map((prob) => (
                <div key={prob.id} className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-stone-900">{prob.title}</h3>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        prob.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prob.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {prob.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 line-clamp-2">{prob.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                    <span>{prob.district} • {prob.domain}</span>
                    <span className="font-bold text-[#1B5E20]">{prob.support_count} Upvotes</span>
                  </div>

                  {prob.status === 'completed' && (
                    <button
                      onClick={() => setRatingProblem(prob)}
                      className="w-full mt-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Star size={13} className="fill-amber-500 text-amber-500" />
                      <span>Submit 5-Star Citizen Rating</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CITIZEN 1-5 STAR RATING MODAL */}
      {ratingProblem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Star size={15} className="fill-amber-500 text-amber-500" />
                <span>Verify & Rate Resolution</span>
              </h3>
              <button
                onClick={() => setRatingProblem(null)}
                className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
              >
                <X size={13} />
              </button>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-xl text-xs font-medium text-stone-800 border border-stone-200">
              {ratingProblem.title}
            </div>

            {/* Star Selector */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    triggerHaptics();
                    setStarCount(s);
                  }}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    size={28}
                    className={
                      s <= starCount
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-stone-300 hover:text-amber-300'
                    }
                  />
                </button>
              ))}
            </div>
            <div className="text-center text-xs font-bold text-amber-800">
              {starCount === 5
                ? '5/5: Excellent - Fully Resolved on Ground'
                : starCount === 4
                ? '4/5: Good - Noticeable Improvement'
                : starCount === 3
                ? '3/5: Moderate Impact'
                : starCount === 2
                ? '2/5: Partial - Issue Persists'
                : '1/5: Unsatisfactory - Ground Reality Unchanged'}
            </div>

            <textarea
              rows={3}
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              placeholder="Provide specific feedback on water quality, road condition, or school improvement..."
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#1B5E20] outline-none"
            ></textarea>

            <button
              type="button"
              onClick={() => {
                submitCitizenRating(
                  ratingProblem.id,
                  starCount,
                  ratingFeedback.trim() || 'Verified by Citizen Reporter.',
                );
                setRatingProblem(null);
                setRatingFeedback('');
              }}
              className="w-full py-2 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Submit Official Rating
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
