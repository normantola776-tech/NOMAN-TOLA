import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
  Sparkles,
  Flame,
  CheckCircle2,
  BookOpen,
  Brain,
} from 'lucide-react';
import { focusAudio } from '../utils/focusAudio.ts';

interface Props {
  onSessionComplete?: (minutes: number, topic: string) => void;
}

export const DeepFocusChamber: React.FC<Props> = ({ onSessionComplete }) => {
  // Timer state (25 minutes default)
  const [sessionDuration, setSessionDuration] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSprints, setCompletedSprints] = useState<number>(2);
  const [studyTopic, setStudyTopic] = useState<string>('Physics Paper 2: Electromagnetism & Induction');

  // Ambient Audio state
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioMode, setAudioMode] = useState<'rain' | 'alpha' | 'hum'>('rain');
  const [volume, setVolume] = useState<number>(0.35);

  const timerRef = useRef<any>(null);

  // Handle countdown
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setCompletedSprints((s) => s + 1);
            focusAudio.playTimerCompletionChime();
            if (onSessionComplete) {
              onSessionComplete(sessionDuration, studyTopic);
            }
            return sessionDuration * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, sessionDuration, studyTopic, onSessionComplete]);

  // Audio control
  const toggleAudio = () => {
    if (isAudioPlaying) {
      focusAudio.stop();
      setIsAudioPlaying(false);
    } else {
      focusAudio.start(audioMode, volume);
      setIsAudioPlaying(true);
    }
  };

  const handleModeChange = (mode: 'rain' | 'alpha' | 'hum') => {
    setAudioMode(mode);
    if (isAudioPlaying) {
      focusAudio.start(mode, volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    focusAudio.setVolume(newVol);
  };

  const handleSetDuration = (mins: number) => {
    if (isRunning) return;
    setSessionDuration(mins);
    setTimeLeft(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(sessionDuration * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((sessionDuration * 60 - timeLeft) / (sessionDuration * 60)) * 100;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 text-white">
      {/* High-Resolution Deep Concentration Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1600&q=80"
          alt="Student deep in academic study"
          className="w-full h-full object-cover object-center opacity-30 filter brightness-90 contrast-125"
        />
        {/* Optical Deep Indigo Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/92 to-indigo-950/85" />
      </div>

      <div className="relative z-10 p-5 sm:p-7 space-y-5">
        {/* Header with Focus Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                <span>Deep Focus Chamber • UNEB Concentration Sprint</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                <Flame className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                <span>{completedSprints} Sprints Done Today</span>
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Study Concentration & Pomodoro Sanctuary
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Lock in for a distraction-free sprint. Pair with ambient academic audio to achieve the psychological flow state proven to boost memory retention by 40%.
            </p>
          </div>

          {/* Quick preset sprint selectors */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleSetDuration(15)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                sessionDuration === 15 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              15m Quick
            </button>
            <button
              type="button"
              onClick={() => handleSetDuration(25)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                sessionDuration === 25 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              25m Focus
            </button>
            <button
              type="button"
              onClick={() => handleSetDuration(45)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                sessionDuration === 45 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              45m Master
            </button>
          </div>
        </div>

        {/* Focus Intention Input */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2 text-indigo-400 shrink-0 pl-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Active Focus Target:
            </span>
          </div>
          <input
            type="text"
            value={studyTopic}
            onChange={(e) => setStudyTopic(e.target.value)}
            placeholder="e.g., Mathematics: Circle Theorems & Proofs (UNEB Paper 1)"
            className="flex-1 bg-transparent border-0 text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-hidden px-2 py-1"
          />
        </div>

        {/* Centerpiece: Big Digital Timer & Circular Glow */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Timer Display */}
          <div className="md:col-span-7 bg-slate-900/70 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56">
              {/* Progress Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-slate-800"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-indigo-500 transition-all duration-500 ease-out"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>

              {/* Time digits */}
              <div className="absolute flex flex-col items-center justify-center space-y-1">
                <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-300">
                  {isRunning ? '🔥 High Concentration' : 'Paused • Ready'}
                </span>
              </div>
            </div>

            {/* Timer action buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white ring-2 ring-amber-400/40'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white ring-2 ring-indigo-400/40'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause Sprint</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Concentration</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                title="Reset Timer"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ambient Study Sound Synthesizer & Tips */}
          <div className="md:col-span-5 space-y-4">
            {/* Ambient Sound Box */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Ambient Study Atmosphere</span>
                </div>
                <button
                  type="button"
                  onClick={toggleAudio}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isAudioPlaying
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {isAudioPlaying ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Play Sound</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleModeChange('rain')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold text-center transition-colors ${
                    audioMode === 'rain'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  Library Rain
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('alpha')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold text-center transition-colors ${
                    audioMode === 'alpha'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  Alpha 40Hz
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('hum')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold text-center transition-colors ${
                    audioMode === 'hum'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  Deep Hum
                </button>
              </div>

              {/* Volume Slider */}
              <div className="pt-2 flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[10px] text-slate-400 font-mono w-7 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>

            {/* Study Concentration Protocol Card */}
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Uganda Top-School Study Protocol</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Put your phone on silent and place it face down out of eyesight.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Work out steps on clean scrap paper before reading answers.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Review any mistake immediately—errors are clues to mastery.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
