import React, { useState } from 'react';
import api from '../../lib/api.js';
import VideoPlayerModal, { resolveVideoUrl } from '../common/VideoPlayerModal.jsx';
import {
  X,
  Award,
  ExternalLink,
  AlertCircle,
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
  Gamepad2,
  RotateCcw,
  Zap,
  BookOpen,
  Keyboard,
} from 'lucide-react';

function getScratchProjectId(url) {
  if (!url) return null;
  const match = url.match(/projects\/(\d+)/i);
  return match ? match[1] : null;
}

export default function Round2RubricModal({ team, existingScore, onClose, onScoreSaved }) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [useTurboWarp, setUseTurboWarp] = useState(true);
  const [playerKey, setPlayerKey] = useState(0);

  // 4 Granular Rubric Criteria (Total 100 PTS)
  // 1. Presentation Quality & Delivery (25 PTS)
  const [pres, setPres] = useState(existingScore?.presentationQualityScore ?? 0);
  // 2. Code Walkthrough & Architecture (30 PTS)
  const [expl, setExpl] = useState(existingScore?.projectExplanationScore ?? 0);
  // 3. Technical Defense & Q&A Depth (30 PTS)
  const [qa, setQa] = useState(existingScore?.technicalQaScore ?? 0);
  // 4. Team Collaboration & Synergy (15 PTS)
  const [teamwork, setTeamwork] = useState(existingScore?.teamContributionScore ?? 0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = Number((pres + expl + qa + teamwork).toFixed(1));
  const r1Sub = team?.submissions?.find((s) => s.roundNumber === 1) || team?.r1Submission;
  const r2Sub = team?.submissions?.find((s) => s.roundNumber === 2) || team?.r2Submission;
  const activeSub = r2Sub || r1Sub;
  const challenge = team?.challenge;

  const scratchProjectId = getScratchProjectId(activeSub?.scratchUrl);
  const embedSrc = scratchProjectId
    ? useTurboWarp
      ? `https://turbowarp.org/${scratchProjectId}/embed?autoplay=true`
      : `https://scratch.mit.edu/projects/${scratchProjectId}/embed`
    : null;

  const reloadPlayer = () => setPlayerKey((k) => k + 1);

  const handleScoreChange = (setter, val, max) => {
    const num = Math.min(max, Math.max(0, Number(val) || 0));
    setter(num);
  };

  const handleSubmit = async (isFinal = true) => {
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/judge/score/r2', {
        teamId: team.id,
        presentationQualityScore: pres,
        projectExplanationScore: expl,
        technicalQaScore: qa,
        teamContributionScore: teamwork,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto font-sans">
      <div 
        className="relative w-full max-w-6xl bg-white rounded-3xl border-2 border-amber-400 shadow-2xl my-4 max-h-[96vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-3xl z-30 flex flex-col items-center justify-center space-y-3 p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <Mic className="w-7 h-7 text-white animate-pulse" />
            </div>
            <p className="text-sm font-bold text-slate-900">Transmitting Round 2 Evaluation...</p>
            <p className="text-xs text-slate-600">Recording defense scores and updating Grand Championship standings...</p>
            <div className="w-56 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 mt-2">
              <div className="h-full rounded-full bg-amber-500 animate-pulse w-full" />
            </div>
          </div>
        )}
        
        {/* Header HUD Bar */}
        <div className="bg-slate-50/90 px-6 sm:px-8 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Presentation className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-700" />
                  Round 2 Finalist Evaluation
                </span>
                {team.r2PresentationSlot && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-bold">
                    Slot #{team.r2PresentationSlot}
                  </span>
                )}
                {challenge?.title && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                    {challenge.title}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                Evaluating: <span className="text-blue-600">{team.name}</span>
                {team.accessCode && <span className="text-xs text-slate-500 font-mono font-medium ml-2">({team.accessCode})</span>}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Total Score Capsule */}
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-sm">
              <span className="text-xs text-amber-900 uppercase font-bold tracking-wider">Total Score:</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-600 leading-none">
                {total}
              </span>
              <span className="text-sm text-slate-500 font-semibold">/ 100</span>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition-all cursor-pointer font-bold shrink-0 shadow-xs"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-left space-y-6">
          
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            
            {/* Left Column: Interactive Player + Full Team Details (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Interactive Scratch Player Card */}
              {scratchProjectId ? (
                <div className="p-4 rounded-3xl bg-slate-950 text-white shadow-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <Gamepad2 className="w-4 h-4 text-blue-400" /> Live Scratch Demo
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={reloadPlayer}
                        title="Reload Scratch Player"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setUseTurboWarp(!useTurboWarp)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          useTurboWarp
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Toggle high-performance TurboWarp 60fps player"
                      >
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" /> {useTurboWarp ? '60 FPS Turbo' : 'Standard'}
                        </span>
                      </button>

                      {activeSub?.scratchUrl && (
                        <a
                          href={activeSub.scratchUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Open project on Scratch"
                          className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* The Iframe Player */}
                  <div className="relative w-full aspect-[485/380] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
                    <iframe
                      key={playerKey}
                      src={embedSrc}
                      allowTransparency="true"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      allowFullScreen
                      allow="autoplay; fullscreen; gamepad"
                      className="w-full h-full"
                      title="Scratch Project Preview"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>Click green flag in canvas to test gameplay</span>
                    {activeSub?.scratchUrl && (
                      <a
                        href={activeSub.scratchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-semibold"
                      >
                        Open on Scratch.mit.edu ↗
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-blue-50 border border-blue-200 text-center space-y-3">
                  <Gamepad2 className="w-10 h-10 text-blue-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">Scratch Project Link</h4>
                  {activeSub?.scratchUrl ? (
                    <a
                      href={activeSub.scratchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" /> Open Project on Scratch ↗
                    </a>
                  ) : (
                    <p className="text-xs text-slate-500">No Scratch link submitted.</p>
                  )}
                </div>
              )}

              {/* Theme & Problem Statement Details Card */}
              <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-slate-800 uppercase font-bold tracking-wider">
                      Assigned Game Theme
                    </span>
                  </div>
                  {challenge?.category && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold">
                      {challenge.category}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {challenge?.title || 'Creative Theme'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {challenge?.fullDescription || challenge?.shortDescription || 'No description provided.'}
                  </p>
                </div>

                {/* Team Roster List */}
                {team.members?.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <span className="text-xs text-slate-600 uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" /> Squad Roster ({team.members.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {team.members.map((m, idx) => (
                        <span
                          key={m.id || idx}
                          className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium shadow-3xs"
                        >
                          {m.fullName} {m.isTeamLeader && '👑 (Leader)'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Story & Mechanics Pitch */}
                {activeSub?.shortDescription && (
                  <div className="pt-3 border-t border-slate-200 space-y-1.5">
                    <span className="text-xs text-slate-600 uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" /> Game Story & Mechanics Pitch:
                    </span>
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                      {activeSub.shortDescription}
                    </div>
                  </div>
                )}

                {/* Controls & Instructions */}
                {activeSub?.notes && (
                  <div className="pt-3 border-t border-slate-200 space-y-1.5">
                    <span className="text-xs text-slate-600 uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <Keyboard className="w-4 h-4 text-blue-600" /> Game Controls & Instructions:
                    </span>
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {activeSub.notes}
                    </div>
                  </div>
                )}

                {/* Video Demo Button */}
                {(activeSub?.videoUrl || team.submissions?.find((s) => s.videoUrl)?.videoUrl) && (
                  <div className="pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowVideoModal(true)}
                      className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Watch Gameplay Demo Video ▶</span>
                    </button>
                  </div>
                )}

                {/* Round 1 Score Benchmark */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-600 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-blue-600" /> Round 1 Sprint Score:
                  </span>
                  <span className="font-bold text-blue-700 text-sm">
                    {team.round1Score ? `${team.round1Score} / 100 PTS` : 'Ungraded'}
                  </span>
                </div>

              </div>

            </div>

            {/* Right Column: 4 Clean Rubric Criteria (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Criterion 1: Presentation Quality & Delivery (25 PTS) */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500 transition-all shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-slate-900 block">
                        1. Presentation Quality & Delivery
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        25 PTS Max
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Structure, slide clarity, confidence, pitch storytelling, time management and visual communication
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-200">
                    <input
                      type="number"
                      min="0"
                      max="25"
                      step="1"
                      value={pres}
                      onChange={(e) => handleScoreChange(setPres, e.target.value, 25)}
                      className="w-12 px-1.5 py-0.5 rounded-lg text-right text-base font-bold text-emerald-700 bg-white border border-emerald-300 focus:border-emerald-500 outline-none"
                    />
                    <span className="text-xs text-emerald-900 font-bold">/ 25</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={pres}
                  onChange={(e) => setPres(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2.5 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>0 PTS</span>
                  <span className="text-emerald-700 font-semibold">12.5 PTS (Average)</span>
                  <span className="text-slate-600 font-bold">Max 25 PTS</span>
                </div>
              </div>

              {/* Criterion 2: Code Walkthrough & Architecture (30 PTS) */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-500 transition-all shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-slate-900 block">
                        2. Code Walkthrough & Logic
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                        30 PTS Max
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Explanation of Scratch scripts, variables, broadcast events, game loop, collisions, and modular logic
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 bg-blue-50 px-3 py-1.5 rounded-2xl border border-blue-200">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="1"
                      value={expl}
                      onChange={(e) => handleScoreChange(setExpl, e.target.value, 30)}
                      className="w-12 px-1.5 py-0.5 rounded-lg text-right text-base font-bold text-blue-700 bg-white border border-blue-300 focus:border-blue-500 outline-none"
                    />
                    <span className="text-xs text-blue-900 font-bold">/ 30</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={expl}
                  onChange={(e) => setExpl(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2.5 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>0 PTS</span>
                  <span className="text-blue-700 font-semibold">15 PTS (Average)</span>
                  <span className="text-slate-600 font-bold">Max 30 PTS</span>
                </div>
              </div>

              {/* Criterion 3: Technical Defense & Q&A Depth (30 PTS) */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-amber-500 transition-all shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-slate-900 block">
                        3. Technical Defense & Q&A Depth
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                        30 PTS Max
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Depth of answers to judge questions, defending implementation choices, and handling challenging mechanics
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="1"
                      value={qa}
                      onChange={(e) => handleScoreChange(setQa, e.target.value, 30)}
                      className="w-12 px-1.5 py-0.5 rounded-lg text-right text-base font-bold text-amber-700 bg-white border border-amber-300 focus:border-amber-500 outline-none"
                    />
                    <span className="text-xs text-amber-900 font-bold">/ 30</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={qa}
                  onChange={(e) => setQa(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2.5 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>0 PTS</span>
                  <span className="text-amber-700 font-semibold">15 PTS (Average)</span>
                  <span className="text-slate-600 font-bold">Max 30 PTS</span>
                </div>
              </div>

              {/* Criterion 4: Team Collaboration & Synergy (15 PTS) */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-purple-500 transition-all shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-slate-900 block">
                        4. Teamwork & Role Synergy
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold">
                        15 PTS Max
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Equal contribution, balanced speaking time across members, respectful handoffs, and squad coordination
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 bg-purple-50 px-3 py-1.5 rounded-2xl border border-purple-200">
                    <input
                      type="number"
                      min="0"
                      max="15"
                      step="1"
                      value={teamwork}
                      onChange={(e) => handleScoreChange(setTeamwork, e.target.value, 15)}
                      className="w-12 px-1.5 py-0.5 rounded-lg text-right text-base font-bold text-purple-700 bg-white border border-purple-300 focus:border-purple-500 outline-none"
                    />
                    <span className="text-xs text-purple-900 font-bold">/ 15</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={teamwork}
                  onChange={(e) => setTeamwork(Number(e.target.value))}
                  className="w-full accent-purple-500 h-2.5 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>0 PTS</span>
                  <span className="text-purple-700 font-semibold">7.5 PTS (Average)</span>
                  <span className="text-slate-600 font-bold">Max 15 PTS</span>
                </div>
              </div>

              {/* Actions Buttons */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border border-slate-200"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  className="px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold transition-all shadow-md flex items-center gap-2.5 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting...' : `Submit Final Score (${total} / 100)`}</span>
                </button>
              </div>

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
