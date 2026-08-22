import React, { useState } from 'react';
import api from '../../lib/api.js';
import VideoPlayerModal, { resolveVideoUrl } from '../common/VideoPlayerModal.jsx';
import {
  X,
  Award,
  ExternalLink,
  AlertCircle,
  Info,
  Send,
  Presentation,
  Save,
  CheckCircle2,
  Trophy,
  Sparkles,
  MessageSquare,
  Mic,
  Users,
  Play,
  FileVideo,
} from 'lucide-react';

const QUICK_COMMENTS = [
  'Exceptional delivery, confidence, and slide structure!',
  'Deep and articulate explanation of Scratch scripts and broadcast blocks.',
  'Confident and precise answers to technical jury questions.',
  'Clear understanding of collision, scoring, and movement logic.',
  'Innovative game mechanics and creative defense during live demo.',
  'Could elaborate more on edge-case bug handling and script architecture.',
];

export default function Round2RubricModal({ team, existingScore, onClose, onScoreSaved }) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [pres, setPres] = useState(existingScore?.presentationQualityScore ?? 0);
  const [expl, setExpl] = useState(
    existingScore?.projectExplanationScore ??
      ((existingScore?.projectExplanationScore || 0) + (existingScore?.technicalQaScore || 0) || 0)
  );
  const [comments, setComments] = useState(existingScore?.comments ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = Number((pres + expl).toFixed(1));
  const r1Sub = team?.submissions?.find((s) => s.roundNumber === 1) || team?.r1Submission;
  const r2Sub = team?.submissions?.find((s) => s.roundNumber === 2) || team?.r2Submission;
  const activeSub = r2Sub || r1Sub;

  const handleScoreChange = (setter, val, max) => {
    const num = Math.min(max, Math.max(0, Number(val) || 0));
    setter(num);
  };

  const handleQuickComment = (text) => {
    if (!comments.includes(text)) {
      setComments((prev) => (prev ? `${prev}\n• ${text}` : `• ${text}`));
    }
  };

  const handleSubmit = async (isFinal = true) => {
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/judge/score/r2', {
        teamId: team.id,
        presentationQualityScore: pres,
        projectExplanationScore: expl,
        technicalQaScore: 0,
        teamContributionScore: 0,
        comments,
        isFinal,
      });

      if (onScoreSaved) onScoreSaved(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit Round 2 score.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl border-4 border-[#f6ab3c] p-5 sm:p-7 shadow-[8px_8px_0px_#fde68a] my-4 max-h-[94vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs rounded-3xl z-20 flex flex-col items-center justify-center space-y-3 p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#f6ab3c] to-[#ffbe00] text-white flex items-center justify-center shadow-md border-2 border-white">
              <Mic className="w-6 h-6 text-white animate-pulse" />
            </div>
            <p className="text-xs font-bold font-pixel text-[#1e293b]">TRANSMITTING ROUND 2 EVALUATION...</p>
            <p className="text-[11px] font-retro text-[#64748b]">Saving finalist pitch scores and updating grand champion rankings...</p>
            <div className="w-48 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full rounded-full bg-[#f6ab3c] animate-pulse w-full" />
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f6ab3c] to-[#ffbe00] text-white flex items-center justify-center shadow-[2px_2px_0px_#a4640c] shrink-0 border border-white">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-pixel px-2 py-0.5 rounded bg-amber-50 text-[#f6ab3c] border border-amber-200 uppercase font-black flex items-center gap-1">
                  <Trophy className="w-2.5 h-2.5 text-[#f6ab3c]" />
                  ROUND 2 RUBRIC (PRESENT & DEFEND — 100 PTS)
                </span>
                {team.r2PresentationSlot && (
                  <span className="text-[10px] font-pixel px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                    SLOT #{team.r2PresentationSlot}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-xl font-bold font-pixel text-[#1e293b] mt-0.5">
                EVALUATING: <span className="text-[#4e97fe]">{team.name}</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-retro flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
          
          {/* Left Column: Team Profile & Score Totalizer (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Assigned Creative Theme Card */}
            <div className="p-4 rounded-2xl bg-[#fffbf2] border-2 border-[#fde68a] space-y-2.5">
              <span className="text-[10px] font-pixel text-[#f6ab3c] uppercase block font-bold">
                ASSIGNED CREATIVE THEME
              </span>
              <h4 className="font-bold font-pixel text-xs sm:text-sm text-[#1e293b]">
                {team.challenge?.title || 'Creative Theme'}
              </h4>
              <p className="text-xs font-retro text-[#64748b] leading-relaxed">
                {team.challenge?.fullDescription || team.challenge?.shortDescription}
              </p>

              {/* Round 1 Score Benchmark */}
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs font-retro">
                <span className="text-[#64748b] font-pixel text-[10px] uppercase flex items-center gap-1">
                  <Award className="w-3 h-3 text-[#4e97fe]" /> Round 1 Sprint Score:
                </span>
                <span className="font-bold font-pixel text-xs text-[#4e97fe]">
                  {team.round1Score ? `${team.round1Score} / 100 PTS` : 'Ungraded'}
                </span>
              </div>

              {/* Direct Scratch Project Link & Video Demo Link */}
              <div className="flex flex-col gap-2 pt-1">
                {activeSub?.scratchUrl && (
                  <a
                    href={activeSub.scratchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#ffbe00] hover:bg-[#ebae00] text-[#141720] font-pixel text-xs flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_#a4640c] font-black cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>OPEN SCRATCH PROJECT ↗</span>
                  </a>
                )}

                {(activeSub?.videoUrl || team.submissions?.find((s) => s.videoUrl)?.videoUrl) && (
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-pixel text-xs flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_#9f1239] font-bold cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>WATCH GAMEPLAY DEMO VIDEO ▶</span>
                  </button>
                )}
              </div>
            </div>

            {/* Total Round 2 Score Display */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-[#fffdfa] to-[#fff8ec] border-3 border-[#fde68a] text-center shadow-sm space-y-2">
              <span className="text-[10px] font-pixel text-[#64748b] uppercase block font-bold">
                TOTAL ROUND 2 PITCH SCORE
              </span>
              <div className="flex items-baseline justify-center gap-1 my-1">
                <span className="text-4xl sm:text-5xl font-black font-pixel text-[#f6ab3c]">
                  {total}
                </span>
                <span className="text-sm font-pixel text-[#64748b]">/ 100</span>
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-pixel font-bold">
                {total >= 90
                  ? 'Grand Champion Contender'
                  : total >= 80
                  ? 'Podium Contender'
                  : total >= 65
                  ? 'Strong Finalist Pitch'
                  : total > 0
                  ? 'Evaluation In Progress'
                  : 'Unscored'}
              </div>
            </div>

            {/* Quick Feedback Suggestions */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-pixel text-[#64748b] uppercase block font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#f6ab3c]" /> Quick Feedback Tags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_COMMENTS.map((qc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickComment(qc)}
                    className="text-[10px] font-retro text-left px-2 py-1 rounded-lg bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 transition-all cursor-pointer"
                  >
                    {qc}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: The 2 Core Rubric Criteria + Notice Box + Comments (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* 1. PRESENTATION QUALITY (30%) */}
            <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-emerald-400 transition-all shadow-2xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold font-pixel text-[#1e293b] block">
                      PRESENTATION QUALITY
                    </span>
                    <span className="text-[10px] font-pixel px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 font-black">
                      30% (MAX 30 PTS)
                    </span>
                  </div>
                  <p className="text-[11px] font-retro text-[#64748b] mt-1 leading-relaxed">
                    Structure, clarity, confidence, time management and visual communication
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="1"
                    value={pres}
                    onChange={(e) => handleScoreChange(setPres, e.target.value, 30)}
                    className="w-12 px-1 py-0.5 rounded text-right font-pixel text-sm font-black text-emerald-700 bg-white border border-emerald-300 focus:border-emerald-500 outline-none"
                  />
                  <span className="text-xs font-pixel text-emerald-800 font-bold">/ 30</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={pres}
                onChange={(e) => setPres(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] font-pixel text-slate-400 font-bold">
                <span>0 PTS</span>
                <span className="text-emerald-700">15 PTS (AVERAGE)</span>
                <span className="text-emerald-800">MAX 30 PTS</span>
              </div>
            </div>

            {/* 2. PROJECT EXPLANATION & TECHNICAL Q&A (70%) */}
            <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-amber-400 transition-all shadow-2xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold font-pixel text-[#1e293b] block">
                      PROJECT EXPLANATION & TECHNICAL Q&A
                    </span>
                    <span className="text-[10px] font-pixel px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-black">
                      70% (MAX 70 PTS)
                    </span>
                  </div>
                  <p className="text-[11px] font-retro text-[#64748b] mt-1 leading-relaxed">
                    Depth of understanding, explaining logic & design decisions, answering judge questions, and defending implementation choices
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                  <input
                    type="number"
                    min="0"
                    max="70"
                    step="1"
                    value={expl}
                    onChange={(e) => handleScoreChange(setExpl, e.target.value, 70)}
                    className="w-12 px-1 py-0.5 rounded text-right font-pixel text-sm font-black text-amber-700 bg-white border border-amber-300 focus:border-amber-500 outline-none"
                  />
                  <span className="text-xs font-pixel text-amber-800 font-bold">/ 70</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="70"
                step="1"
                value={expl}
                onChange={(e) => setExpl(Number(e.target.value))}
                className="w-full accent-amber-500 h-2.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] font-pixel text-slate-400 font-bold">
                <span>0 PTS</span>
                <span className="text-amber-700">35 PTS (AVERAGE)</span>
                <span className="text-amber-800">MAX 70 PTS</span>
              </div>
            </div>

            {/* Defense Notice Banner (Matching Official Rubric) */}
            <div className="p-4 rounded-2xl bg-indigo-950/5 border-2 border-indigo-200/80 text-indigo-950 flex items-start gap-3 shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <p className="text-xs font-retro leading-relaxed text-slate-700">
                <strong className="text-indigo-950 font-pixel block text-[10px] uppercase font-bold mb-0.5 tracking-wide">
                  Jury Defense Requirement:
                </strong>
                During Round 2, judges may ask any team member to explain specific scripts, variables or mechanics. If a team cannot explain a substantial portion of its own project, scores may be reduced.
              </p>
            </div>

            {/* Feedback Comments */}
            <div>
              <label className="block text-xs font-bold font-pixel text-[#1e293b] mb-1">
                FINALIST JURY FEEDBACK & DEFENSE NOTES :
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share strengths, constructive tips, code defense observations, and final thoughts..."
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-retro text-[#1e293b] focus:border-[#f6ab3c] outline-none resize-none"
              />
            </div>

            {/* Actions Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#475569] text-xs font-pixel transition-all cursor-pointer flex items-center gap-1.5 font-bold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE DRAFT</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#f6ab3c] hover:bg-[#e69828] text-white text-xs font-pixel transition-all shadow-[3px_3px_0px_#a4640c] flex items-center gap-2 cursor-pointer disabled:opacity-50 font-black"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'SUBMITTING...' : `SUBMIT FINAL SCORE (${total} / 100)`}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {showVideoModal && (activeSub?.videoUrl || team.submissions?.find((s) => s.videoUrl)?.videoUrl) && (
        <VideoPlayerModal
          video={{
            url: resolveVideoUrl(activeSub?.videoUrl || team.submissions?.find((s) => s.videoUrl)?.videoUrl),
            rawUrl: activeSub?.videoUrl || team.submissions?.find((s) => s.videoUrl)?.videoUrl,
            title: team.name,
            fileName: activeSub?.videoFileName || team.submissions?.find((s) => s.videoUrl)?.videoFileName || 'Gameplay Demo Video',
          }}
          onClose={() => setShowVideoModal(false)}
        />
      )}
    </div>
  );
}

