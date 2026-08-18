import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SendIcon,
  UsersIcon,
  FileTextIcon,
  FileSignatureIcon,
  EyeIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
  SearchIcon,
  ClockIcon,
  AlertTriangleIcon,
  FilterIcon,
  AwardIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassBadge } from '../components/ui/GlassBadge';
import { GlassInput, GlassTextarea, GlassSelect } from '../components/ui/GlassInput';
import { useToast } from '../context/ToastContext';

const STEPS = [
  { id: 1, title: 'Campaign Details', icon: SendIcon },
  { id: 2, title: 'Select Candidates', icon: UsersIcon },
  { id: 3, title: 'Email Template', icon: FileTextIcon },
  { id: 4, title: 'Document & PDF', icon: FileSignatureIcon },
  { id: 5, title: 'Personalization Preview', icon: EyeIcon },
  { id: 6, title: 'Schedule Options', icon: CalendarIcon },
  { id: 7, title: 'Confirmation & Launch', icon: CheckCircle2Icon },
];

const CandidateWizardItem = React.memo(({ cand, isSelected, onToggle }) => {
  const isOfferReady = ['Selected', 'Shortlisted', 'Offer Sent', 'Offer Accepted'].includes(cand.status);
  const hasPdfDetails = Boolean(cand.salary && cand.joiningDate);

  return (
    <div
      onClick={() => onToggle(cand._id)}
      className={`p-3.5 rounded-xl glass border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isSelected
          ? 'bg-white/15 border-indigo-400/50 shadow-md shadow-indigo-500/10'
          : 'border-white/10 hover:bg-white/5'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div
          className={`size-4.5 rounded border flex items-center justify-center shrink-0 transition mt-0.5 sm:mt-0 ${
            isSelected ? 'bg-indigo-500 border-indigo-400' : 'border-white/30'
          }`}
        >
          {isSelected && <CheckCircle2Icon className="size-3.5 text-white" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white text-sm truncate">{cand.fullName}</span>
            {isOfferReady ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 shrink-0">
                📜 Offer Letter Candidate
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                🎙️ Interview Stage
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5 truncate max-w-full">
            {cand.email} • {cand.jobRole} ({cand.department})
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 pl-7 sm:pl-0 shrink-0">
        {hasPdfDetails ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
            📄 PDF Supported
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-gray-400 border border-white/10 shrink-0">
            ✉️ Email Only
          </span>
        )}
        <GlassBadge status={cand.status} />
      </div>
    </div>
  );
});

export function CampaignWizardPage() {
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Available Data
  const [candidates, setCandidates] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [docTemplates, setDocTemplates] = useState([]);

  // Wizard State
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState('');
  const [selectedDocTemplateId, setSelectedDocTemplateId] = useState('');
  const [sendOption, setSendOption] = useState('immediate');
  const [scheduledAt, setScheduledAt] = useState('');

  // Step 2 Filters
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidatePurposeFilter, setCandidatePurposeFilter] = useState('all'); // 'all' | 'offer' | 'interview' | 'pdf'

  // Preview State
  const [previewCandidateIndex, setPreviewCandidateIndex] = useState(0);
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const handleToggleCandidate = useCallback((id) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  useEffect(() => {
    async function loadResources() {
      try {
        const [candRes, emailRes, docRes] = await Promise.all([
          api.get('/candidates', { params: { limit: 100 } }),
          api.get('/email-templates'),
          api.get('/document-templates'),
        ]);

        if (candRes.success) setCandidates(candRes.data);
        if (emailRes.success) {
          setEmailTemplates(emailRes.data);
          if (emailRes.data.length > 0) setSelectedEmailTemplateId(emailRes.data[0]._id);
        }
        if (docRes.success) setDocTemplates(docRes.data);
      } catch (err) {
        console.warn('Could not load campaign wizard dependencies:', err.message);
      }
    }
    loadResources();
  }, []);

  // Update preview when candidate or template changes
  useEffect(() => {
    if (currentStep === 5 && selectedCandidateIds.length > 0 && selectedEmailTemplateId) {
      const activeCandidateId = selectedCandidateIds[previewCandidateIndex] || selectedCandidateIds[0];
      fetchPreview(activeCandidateId, selectedEmailTemplateId);
    }
  }, [currentStep, previewCandidateIndex, selectedCandidateIds, selectedEmailTemplateId]);

  const fetchPreview = async (candidateId, templateId) => {
    try {
      setIsPreviewLoading(true);
      const res = await api.post('/email-templates/preview', {
        candidateId,
        templateId,
      });
      if (res.success) {
        setPreviewData(res.data);
      }
    } catch (err) {
      console.warn('Failed to load preview:', err.message);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!campaignName.trim()) {
        warning('Please provide a campaign name.');
        return;
      }
    }
    if (currentStep === 2) {
      if (selectedCandidateIds.length === 0) {
        warning('Please select at least one candidate for this campaign.');
        return;
      }
    }
    if (currentStep === 3) {
      if (!selectedEmailTemplateId) {
        warning('Please select an email template.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleLaunchCampaign = async () => {
    try {
      setLoading(true);
      const payload = {
        name: campaignName.trim(),
        description: campaignDescription.trim(),
        recipientCandidateIds: selectedCandidateIds,
        emailTemplateId: selectedEmailTemplateId,
        documentTemplateId: selectedDocTemplateId || null,
        scheduledAt: sendOption === 'scheduled' && scheduledAt ? scheduledAt : null,
      };

      const res = await api.post('/campaigns', payload);
      if (res.success) {
        const campaign = res.data;

        if (sendOption === 'immediate') {
          await api.post(`/campaigns/${campaign._id}/send`);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          success(`Campaign "${campaign.name}" dispatched! Real emails are transmitting to candidate inboxes.`);
        } else {
          success(`Campaign "${campaign.name}" scheduled for ${new Date(scheduledAt).toLocaleString()}`);
        }

        navigate(`/campaigns/${campaign._id}`);
      }
    } catch (err) {
      error(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  // Filter candidates based on purpose
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.fullName?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.jobRole?.toLowerCase().includes(candidateSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (candidatePurposeFilter === 'offer') {
      return ['Selected', 'Shortlisted', 'Offer Sent', 'Offer Accepted'].includes(c.status);
    }
    if (candidatePurposeFilter === 'interview') {
      return ['Applied', 'Interview', 'Screening'].includes(c.status);
    }
    if (candidatePurposeFilter === 'pdf') {
      return Boolean(c.salary && c.joiningDate);
    }
    return true;
  });

  const offerCandidates = candidates.filter((c) =>
    ['Selected', 'Shortlisted', 'Offer Sent', 'Offer Accepted'].includes(c.status)
  );
  const interviewCandidates = candidates.filter((c) =>
    ['Applied', 'Interview', 'Screening'].includes(c.status)
  );

  const selectedCandidatesList = candidates.filter((c) => selectedCandidateIds.includes(c._id));
  const chosenEmailTemplate = emailTemplates.find((t) => t._id === selectedEmailTemplateId);
  const chosenDocTemplate = docTemplates.find((t) => t._id === selectedDocTemplateId);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Centered Hero Header - Matching Theme */}
      <section className="flex flex-col items-center text-center space-y-4 pt-4">
        <motion.div
          className="flex items-center gap-2.5 glass px-4 py-1.5 rounded-full text-xs font-medium text-gray-200 shadow-xl border-white/20"
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <SparklesIcon className="size-3.5 text-amber-400" />
          <span>Enterprise Recruitment Email &amp; Document Automation</span>
        </motion.div>

        <motion.h1
          className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Start{' '}
          <span className="bg-gradient-to-r from-[#D10A8A] via-[#F26A06] to-[#2E08CF] bg-clip-text text-transparent">
            Automation Wizard
          </span>
        </motion.h1>

        <motion.p
          className="text-gray-300 text-sm max-w-xl"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          7-step guided workflow with candidate intent filtering, automated PDF generation, and verified live personalization.
        </motion.p>
      </section>

      {/* Wizard Progress Bar */}
      <div className="glass p-4 rounded-2xl border border-white/15 overflow-x-auto custom-scrollbar shadow-2xl">
        <div className="flex items-center justify-between min-w-[600px] relative">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 -z-1" />
          <div
            className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-[#D10A8A] to-[#2E08CF] -z-1 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <button
                key={step.id}
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                }}
                disabled={step.id > currentStep}
                className={`flex flex-col items-center gap-1.5 transition select-none ${
                  step.id > currentStep ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div
                  className={`size-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : isCurrent
                      ? 'glass bg-gradient-to-tr from-[#D10A8A] to-[#2E08CF] text-white ring-2 ring-white/40 shadow-lg'
                      : 'glass bg-black/60 text-gray-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2Icon className="size-4" /> : step.id}
                </div>
                <span className={`text-[10px] font-medium ${isCurrent ? 'text-white font-semibold' : 'text-gray-400'}`}>
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wizard Content Step Container */}
      <GlassCard animate={false} className="p-6 sm:p-8 space-y-6 shadow-2xl">
        <AnimatePresence mode="wait">
          {/* STEP 1: Campaign Details */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Step 1: Campaign Information</h3>
                <p className="text-xs text-gray-400">Give your recruitment outreach campaign a clear name and goal.</p>
              </div>

              <GlassInput
                label="Campaign Name"
                required
                placeholder="e.g. 2026 Fall Software Engineer Offers"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />

              <GlassTextarea
                label="Campaign Description & Goals"
                rows={4}
                placeholder="Batch job offer letters with compensation packages and joining guidelines for core platform candidates."
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
              />
            </motion.div>
          )}

          {/* STEP 2: Select Candidates with Purpose Filters */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white">Step 2: Select Target Candidates</h3>
                  <p className="text-xs text-gray-400">
                    Filter by Offer Letters, Interview Invitations, or with attached PDF contracts.
                  </p>
                </div>

                <div className="text-xs font-semibold text-indigo-300">
                  {selectedCandidateIds.length} candidate(s) selected
                </div>
              </div>

              {/* Workflow Purpose Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl glass bg-white/5 border border-white/10 text-xs">
                <button
                  onClick={() => setCandidatePurposeFilter('all')}
                  className={`py-1.5 px-3 rounded-lg font-medium transition cursor-pointer ${
                    candidatePurposeFilter === 'all' ? 'glass bg-white/20 text-white font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All Candidates ({candidates.length})
                </button>
                <button
                  onClick={() => setCandidatePurposeFilter('offer')}
                  className={`py-1.5 px-3 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    candidatePurposeFilter === 'offer' ? 'glass bg-fuchsia-500/30 text-fuchsia-200 border-fuchsia-400/40 font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <AwardIcon className="size-3.5 text-fuchsia-400" />
                  <span>For Offer Letters ({offerCandidates.length})</span>
                </button>
                <button
                  onClick={() => setCandidatePurposeFilter('interview')}
                  className={`py-1.5 px-3 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    candidatePurposeFilter === 'interview' ? 'glass bg-cyan-500/30 text-cyan-200 border-cyan-400/40 font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <UsersIcon className="size-3.5 text-cyan-400" />
                  <span>For Interviews ({interviewCandidates.length})</span>
                </button>
                <button
                  onClick={() => setCandidatePurposeFilter('pdf')}
                  className={`py-1.5 px-3 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    candidatePurposeFilter === 'pdf' ? 'glass bg-emerald-500/30 text-emerald-200 border-emerald-400/40 font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileSignatureIcon className="size-3.5 text-emerald-400" />
                  <span>With PDF Info</span>
                </button>
              </div>

              {/* Search and Quick Selection Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex-1">
                  <GlassInput
                    icon={SearchIcon}
                    placeholder="Search candidates by name, email, or role..."
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <GlassButton
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (candidatePurposeFilter === 'offer') {
                        setSelectedCandidateIds(offerCandidates.map((c) => c._id));
                      } else if (candidatePurposeFilter === 'interview') {
                        setSelectedCandidateIds(interviewCandidates.map((c) => c._id));
                      } else {
                        setSelectedCandidateIds(filteredCandidates.map((c) => c._id));
                      }
                    }}
                  >
                    Select Filtered
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    variant="glass"
                    onClick={() => setSelectedCandidateIds([])}
                  >
                    Clear
                  </GlassButton>
                </div>
              </div>

              {/* Candidate Cards List */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredCandidates.map((cand) => {
                  const isSelected = selectedCandidateIds.includes(cand._id);
                  return (
                    <CandidateWizardItem
                      key={cand._id}
                      cand={cand}
                      isSelected={isSelected}
                      onToggle={handleToggleCandidate}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Select Email Template */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Step 3: Select Email Template</h3>
                <p className="text-xs text-gray-400">Choose the personalized email body and subject format.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {emailTemplates.map((tpl) => {
                  const isSelected = selectedEmailTemplateId === tpl._id;
                  return (
                    <div
                      key={tpl._id}
                      onClick={() => setSelectedEmailTemplateId(tpl._id)}
                      className={`p-5 rounded-2xl glass border transition cursor-pointer space-y-3 ${
                        isSelected
                          ? 'bg-white/15 border-indigo-400 shadow-lg shadow-indigo-500/10'
                          : 'border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{tpl.name}</span>
                        <GlassBadge status={tpl.category} />
                      </div>
                      <div className="text-xs text-gray-300 line-clamp-1 font-mono">
                        Subject: {tpl.subject}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tpl.variables?.slice(0, 4).map((v) => (
                          <span key={v} className="px-2 py-0.5 rounded-full text-[10px] glass text-gray-400">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Select Document Template */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Step 4: Attach Automated PDF Document</h3>
                <p className="text-xs text-gray-400">
                  Optionally attach a server-generated personalized Offer Letter or Certificate to each candidate's email.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setSelectedDocTemplateId('')}
                  className={`p-5 rounded-2xl glass border transition cursor-pointer space-y-2 ${
                    selectedDocTemplateId === ''
                      ? 'bg-white/15 border-indigo-400 shadow-lg shadow-indigo-500/10'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="font-bold text-white text-sm">No Document Attachment</div>
                  <p className="text-xs text-gray-400">Send personalized email only without generated PDF.</p>
                </div>

                {docTemplates.map((doc) => {
                  const isSelected = selectedDocTemplateId === doc._id;
                  return (
                    <div
                      key={doc._id}
                      onClick={() => setSelectedDocTemplateId(doc._id)}
                      className={`p-5 rounded-2xl glass border transition cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-white/15 border-indigo-400 shadow-lg shadow-indigo-500/10'
                          : 'border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{doc.name}</span>
                        <span className="text-[10px] uppercase font-semibold text-indigo-300">{doc.type}</span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{doc.description || 'Dynamic PDF contract.'}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 5: Live Personalization Preview */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white">Step 5: Live Personalization Verification</h3>
                  <p className="text-xs text-gray-400">
                    Switch between candidates to verify dynamic tag interpolation before sending.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Previewing:</span>
                  <select
                    className="glass bg-zinc-900 border border-white/20 rounded-xl px-3 py-1 text-xs text-white outline-none cursor-pointer"
                    value={previewCandidateIndex}
                    onChange={(e) => setPreviewCandidateIndex(Number(e.target.value))}
                  >
                    {selectedCandidatesList.map((cand, idx) => (
                      <option key={cand._id} value={idx} className="bg-zinc-900 text-white">
                        {cand.fullName} ({cand.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isPreviewLoading ? (
                <div className="p-12 text-center text-gray-400 glass rounded-2xl animate-pulse">
                  Generating dynamic candidate preview...
                </div>
              ) : previewData ? (
                <div className="space-y-3 p-5 rounded-2xl glass bg-white/5 border border-white/20">
                  <div className="space-y-1 pb-3 border-b border-white/10 text-xs">
                    <div>
                      <span className="text-gray-400">TO: </span>
                      <span className="font-semibold text-white">
                        {previewData.candidate?.fullName} &lt;{previewData.candidate?.email}&gt;
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">SUBJECT: </span>
                      <span className="font-semibold text-indigo-300">{previewData.subject}</span>
                    </div>
                    {chosenDocTemplate && (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs mt-1">
                        <FileSignatureIcon className="size-3.5" />
                        <span>Attached: {previewData.candidate?.fullName.replace(/\s+/g, '_')}_{chosenDocTemplate.type}.pdf</span>
                      </div>
                    )}
                  </div>

                  <div
                    className="p-4 rounded-xl bg-white text-gray-900 text-xs leading-relaxed max-h-60 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: previewData.bodyHtml }}
                  />
                </div>
              ) : null}
            </motion.div>
          )}

          {/* STEP 6: Schedule Options */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Step 6: Delivery Timing</h3>
                <p className="text-xs text-gray-400">Choose whether to dispatch emails immediately or queue for future delivery.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setSendOption('immediate')}
                  className={`p-5 rounded-2xl glass border transition cursor-pointer space-y-2 ${
                    sendOption === 'immediate'
                      ? 'bg-white/15 border-indigo-400 shadow-lg shadow-indigo-500/10'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <SparklesIcon className="size-4 text-amber-400" />
                    <span>Send Immediately</span>
                  </div>
                  <p className="text-xs text-gray-400">Dispatches campaign directly to background worker queue.</p>
                </div>

                <div
                  onClick={() => setSendOption('scheduled')}
                  className={`p-5 rounded-2xl glass border transition cursor-pointer space-y-2 ${
                    sendOption === 'scheduled'
                      ? 'bg-white/15 border-indigo-400 shadow-lg shadow-indigo-500/10'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <ClockIcon className="size-4 text-indigo-400" />
                    <span>Schedule for Later</span>
                  </div>
                  <p className="text-xs text-gray-400">Set a specific date and time for automatic dispatch.</p>
                </div>
              </div>

              {sendOption === 'scheduled' && (
                <div className="p-4 rounded-xl glass bg-white/5 border border-white/10">
                  <GlassInput
                    type="datetime-local"
                    label="Scheduled Date & Time"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 7: Final Confirmation */}
          {currentStep === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Step 7: Final Confirmation</h3>
                <p className="text-xs text-gray-400">Review all campaign parameters before triggering bulk email dispatch.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-xl glass">
                  <div className="text-2xl font-bold text-indigo-300">{selectedCandidateIds.length}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Recipients</div>
                </div>
                <div className="p-4 rounded-xl glass">
                  <div className="text-2xl font-bold text-emerald-400">{selectedCandidateIds.length}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Valid Emails</div>
                </div>
                <div className="p-4 rounded-xl glass">
                  <div className="text-2xl font-bold text-cyan-300">{chosenDocTemplate ? selectedCandidateIds.length : 0}</div>
                  <div className="text-xs text-gray-400 mt-0.5">PDF Attachments</div>
                </div>
                <div className="p-4 rounded-xl glass">
                  <div className="text-2xl font-bold text-pink-300 uppercase text-sm font-semibold mt-1">
                    {sendOption}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">Delivery Mode</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Campaign Name:</span>
                  <span className="font-semibold text-white">{campaignName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email Template:</span>
                  <span className="font-semibold text-white">{chosenEmailTemplate?.name || 'Selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Document Template:</span>
                  <span className="font-semibold text-white">{chosenDocTemplate?.name || 'None (Email Only)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Idempotency Guard:</span>
                  <span className="font-semibold text-emerald-400">Active (Zero Duplicates)</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <GlassButton
            size="md"
            variant="outline"
            icon={ArrowLeftIcon}
            disabled={currentStep === 1 || loading}
            onClick={handlePrev}
          >
            Back
          </GlassButton>

          {currentStep < 7 ? (
            <GlassButton size="md" variant="gradient" icon={ArrowRightIcon} onClick={handleNext}>
              Next Step
            </GlassButton>
          ) : (
            <GlassButton
              size="lg"
              variant="gradient"
              icon={SendIcon}
              loading={loading}
              onClick={handleLaunchCampaign}
            >
              {sendOption === 'immediate' ? 'Launch Campaign Now' : 'Confirm Schedule'}
            </GlassButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
