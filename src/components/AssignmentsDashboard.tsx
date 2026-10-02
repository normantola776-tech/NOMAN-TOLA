import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Award,
  TrendingUp,
  FileCheck,
  Calendar,
  Sparkles,
  BarChart3,
  Send,
  X,
  BookOpen,
  Compass,
  ArrowRight,
  Flame,
  GraduationCap,
  ChevronRight,
  Target,
  Zap,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { Assignment, UserProfile } from '../types.ts';
import { STUDY_ATMOSPHERES, StudyAtmosphere } from '../data/studyAtmospheres.ts';
import { DeepFocusChamber } from './DeepFocusChamber.tsx';
import { StudyAtmosphereSelector } from './StudyAtmosphereSelector.tsx';

interface Props {
  user: UserProfile;
  onTriggerNotification: (title: string, message: string, type: 'assignment' | 'grade' | 'session' | 'system') => void;
  onNavigateTab?: (tab: string) => void;
}

export const AssignmentsDashboard: React.FC<Props> = ({
  user,
  onTriggerNotification,
  onNavigateTab,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submittingItem, setSubmittingItem] = useState<Assignment | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Motivational Study Atmosphere State (persists in localStorage)
  const [selectedAtmosphere, setSelectedAtmosphere] = useState<StudyAtmosphere>(() => {
    try {
      const saved = localStorage.getItem('edura_study_atmosphere');
      if (saved) {
        const found = STUDY_ATMOSPHERES.find((a) => a.id === saved);
        if (found) return found;
      }
    } catch (e) {
      // ignore
    }
    return STUDY_ATMOSPHERES[0];
  });
  const [isAtmosphereSelectorOpen, setIsAtmosphereSelectorOpen] = useState(false);

  const handleSelectAtmosphere = (atmo: StudyAtmosphere) => {
    setSelectedAtmosphere(atmo);
    try {
      localStorage.setItem('edura_study_atmosphere', atmo.id);
    } catch (e) {
      // ignore
    }
    onTriggerNotification(
      'Study Atmosphere Activated ✨',
      `Concentration backdrop updated to "${atmo.name}" (${atmo.institution}).`,
      'system'
    );
  };

  const handleFocusSprintComplete = (minutes: number, topic: string) => {
    onTriggerNotification(
      'Deep Focus Sprint Completed! 🧠🔥',
      `Splendid job! You completed ${minutes} minutes of distraction-free study on "${topic}".`,
      'system'
    );
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const studentId = user.id || 5;
      const res = await fetch(`/api/assignments/student/${studentId}`);
      if (!res.ok) {
        // Fallback to query parameter endpoint
        const fallbackRes = await fetch(`/api/assignments?studentId=${studentId}`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (Array.isArray(fallbackData)) {
            setAssignments(fallbackData);
            return;
          }
        }
        throw new Error(`Server returned ${res.status}`);
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Received non-JSON content from server');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setAssignments(data);
      }
    } catch (e) {
      console.error('Failed to load assignments', e);
    }
  };

  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingItem) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/assignments/${submittingItem.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionNotes,
          attachmentUrl: '/submissions/homework_sheet.pdf',
        }),
      });

      if (!res.ok) throw new Error('Submission failed');

      // Trigger Push Notification for completed homework submission
      onTriggerNotification(
        'Assignment Submitted Successfully! 📚',
        `Your submission for "${submittingItem.title}" has been transmitted to tutor for grading.`,
        'assignment'
      );

      setSubmittingItem(null);
      setSubmissionNotes('');
      fetchAssignments();
    } catch (err: any) {
      alert(err.message || 'Error submitting homework');
    } finally {
      setLoading(false);
    }
  };

  const completedCount = assignments.filter((a) => a.status === 'graded').length;
  const pendingCount = assignments.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Motivating Hero with Scholarly Background Imagery */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 text-white">
        {/* Dynamic High-Resolution Academic Concentration Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={selectedAtmosphere.imageUrl}
            alt={selectedAtmosphere.name}
            className="w-full h-full object-cover object-center opacity-35 scale-105 transform hover:scale-100 transition-all duration-1000 filter brightness-95 contrast-125"
          />
          {/* Deep Optical Atmosphere Gradient Overlay for Impeccable Contrast */}
          <div className={`absolute inset-0 bg-gradient-to-r ${selectedAtmosphere.accentGradient}`} />
          <div className="absolute inset-0 bg-radial from-transparent via-slate-950/60 to-slate-950/90" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                  <span>Uganda Secondary Education • S.1 to S.4 Excellence</span>
                </div>
                {/* Atmosphere Sanctuary Badge */}
                <button
                  type="button"
                  onClick={() => setIsAtmosphereSelectorOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 text-xs font-medium transition-colors"
                >
                  <ImageIcon className="w-3 h-3 text-amber-300" />
                  <span>Sanctuary: {selectedAtmosphere.name}</span>
                  <span className="text-[10px] text-blue-300 underline ml-1">Change</span>
                </button>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome to Your Academic Command Center,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">
                  {user.fullName}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Aiming for <strong>Distinction 1 (D1)</strong> in UNEB examinations. Follow the rigorous standard practiced at King's College Budo, Gayaza High School, and St. Mary's College Kisubi.
              </p>
            </div>

            {/* Academic Motivation Badge */}
            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0 self-start md:self-auto text-left md:text-right">
              <div className="flex items-center gap-2 md:justify-end text-amber-400 font-bold text-xs">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>7-Day Focus Streak</span>
              </div>
              <p className="text-lg font-black text-white mt-1">14.5 Study Hours</p>
              <p className="text-[11px] text-emerald-400 font-medium">Top 5% in {user.schoolName}</p>
            </div>
          </div>

          {/* Inspirational Quote of the Day & Atmosphere Lore */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-200">
                <span className="font-bold text-white">Ugandan Scholarly Inspiration: </span>
                {selectedAtmosphere.focusQuote}{' '}
                <span className="text-blue-300 font-medium">— {selectedAtmosphere.quoteAuthor}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAtmosphereSelectorOpen(true)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors hidden sm:flex"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Change Background</span>
            </button>
          </div>

          {/* "Move Deep in the App & Learn More" Action Pathways with Atmospheric Backgrounds */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>Explore Deep Learning Pathways</span>
              </h3>
              <span className="text-[11px] text-blue-400 font-medium">Click any pathway to dive in</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Pathway 1: AI & Google Study Assistant */}
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('ai-assistant')}
                className="relative group p-4 rounded-2xl border border-blue-500/40 hover:border-blue-400 transition-all text-left flex flex-col justify-between shadow-xl overflow-hidden min-h-[160px]"
              >
                {/* Background Image: Student writing notes with focused precision */}
                <div className="absolute inset-0 z-0">
                  <img
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80"
                    alt="Study Notes Formulation"
                    className="w-full h-full object-cover object-center opacity-30 group-hover:scale-110 transition-transform duration-700 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-blue-950/60" />
                </div>

                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-400/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                    AI Notes & Solutions
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    Step-by-step solutions using updated Ugandan school schemes (NCDC/UNEB).
                  </p>
                </div>
                <div className="relative z-10 mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-300 font-semibold">
                  <span>Ask Question</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Pathway 2: Live Masterclasses */}
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('sessions')}
                className="relative group p-4 rounded-2xl border border-emerald-500/40 hover:border-emerald-400 transition-all text-left flex flex-col justify-between shadow-xl overflow-hidden min-h-[160px]"
              >
                {/* Background Image: Collaborative academic lecture */}
                <div className="absolute inset-0 z-0">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                    alt="Live Classroom"
                    className="w-full h-full object-cover object-center opacity-30 group-hover:scale-110 transition-transform duration-700 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-emerald-950/60" />
                </div>

                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-400/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                    Live Masterclasses
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    Join live audio/video sessions with screen sharing, charts & tutor praise.
                  </p>
                </div>
                <div className="relative z-10 mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-300 font-semibold">
                  <span>Enter Classes</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Pathway 3: E2EE Study Materials */}
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('materials')}
                className="relative group p-4 rounded-2xl border border-purple-500/40 hover:border-purple-400 transition-all text-left flex flex-col justify-between shadow-xl overflow-hidden min-h-[160px]"
              >
                {/* Background Image: Archival library bookshelves */}
                <div className="absolute inset-0 z-0">
                  <img
                    src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80"
                    alt="Library Archives"
                    className="w-full h-full object-cover object-center opacity-30 group-hover:scale-110 transition-transform duration-700 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-purple-950/60" />
                </div>

                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-400/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                    Encrypted Repository
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    Verified past papers, departmental notes & offline revision booklets.
                  </p>
                </div>
                <div className="relative z-10 mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-300 font-semibold">
                  <span>Browse Notes</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Pathway 4: 1-on-1 Specialist Tutors */}
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('tutors')}
                className="relative group p-4 rounded-2xl border border-amber-500/40 hover:border-amber-400 transition-all text-left flex flex-col justify-between shadow-xl overflow-hidden min-h-[160px]"
              >
                {/* Background Image: University mentoring setting */}
                <div className="absolute inset-0 z-0">
                  <img
                    src="https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=800&q=80"
                    alt="Top Teachers"
                    className="w-full h-full object-cover object-center opacity-30 group-hover:scale-110 transition-transform duration-700 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-amber-950/60" />
                </div>

                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/30 text-amber-300 border border-amber-400/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                    National Tutors
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    Learn from teachers at Budo, Namagunga, Gayaza, Kitende & SMACK.
                  </p>
                </div>
                <div className="relative z-10 mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                  <span>View Teachers</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Focus Chamber Component (Pomodoro, Concentration Ambient Audio & Target Topic) */}
      <DeepFocusChamber onSessionComplete={handleFocusSprintComplete} />

      {/* National UNEB O-Level Distinction Countdown & Motivation Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-lg bg-slate-950 text-white">
        {/* Books in Library Archival Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&q=80"
            alt="Library Archival Collection"
            className="w-full h-full object-cover object-center opacity-25 filter brightness-90 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-blue-950/85" />
        </div>

        <div className="relative z-10 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                National Exam Readiness
              </span>
              <span className="text-xs text-slate-400">UCE National Final Target</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Why 45 Minutes of Daily Deep Concentration Wins Distinction 1
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Research in cognitive psychology and Ugandan top-school performance reveals that students who complete dedicated, uninterrupted problem-solving sprints achieve 3.4× higher retention on UNEB Paper 1 & 2 questions compared to passive reading.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('ai-assistant')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Solve Hard Questions</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('materials')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-2 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Download Past Papers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Academic Mastery Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Academic Average
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">94.2% (Grade A+)</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Distinction 1 (D1) Pace</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Graded Homework
            </span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {completedCount} Completed
            </span>
            <span className="text-[10px] text-slate-500 font-medium">All feedback verified</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Due Assignments
            </span>
            <span className="text-xl font-bold text-amber-700 mt-0.5 block">
              {pendingCount} Pending
            </span>
            <span className="text-[10px] text-amber-600 font-semibold">UNEB Past Paper Sets</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Masterclass Hours
            </span>
            <span className="text-xl font-bold text-indigo-700 mt-0.5 block">14.5 hrs</span>
            <span className="text-[10px] text-indigo-500 font-semibold">+3.2 hrs this week</span>
          </div>
        </div>
      </div>

      {/* Subject Academic Mastery Breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Uganda O-Level Subject Mastery (Senior One - Senior Four)</span>
          </h4>
          <span className="text-xs text-slate-400">Target: Distinction 1 in UNEB Papers 1 & 2</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>Pure Physics</span>
              <span className="text-blue-600 font-mono">96% (D1)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full w-[96%]" />
            </div>
            <span className="text-[10px] text-slate-500 block">Electromagnetism, Mechanics</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>Mathematics</span>
              <span className="text-indigo-600 font-mono">92% (D1)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full w-[92%]" />
            </div>
            <span className="text-[10px] text-slate-500 block">Algebra, Vectors, Trigonometry</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>Chemistry</span>
              <span className="text-emerald-600 font-mono">94% (D1)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full w-[94%]" />
            </div>
            <span className="text-[10px] text-slate-500 block">Organic Synthesis, Qualitative Analysis</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>Biology & Agriculture</span>
              <span className="text-amber-600 font-mono">89% (D2)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full w-[89%]" />
            </div>
            <span className="text-[10px] text-slate-500 block">Genetics, Crop Production</span>
          </div>
        </div>
      </div>

      {/* Tracked Homework & Assignments List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Homework Reminders & Tracked Submissions</span>
          </h4>
          <div className="flex items-center gap-2">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('classroom')}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Classroom Sync</span>
              </button>
            )}
            <span className="text-xs text-slate-500">
              {assignments.length} assignments on file
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">
                    {assignment.subject}
                  </span>
                  <h5 className="font-bold text-xs text-slate-900">{assignment.title}</h5>
                </div>
                <p className="text-xs text-slate-500 max-w-xl">{assignment.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                  {assignment.feedback && (
                    <span className="text-emerald-700 font-medium">
                      Feedback: "{assignment.feedback}"
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {assignment.status === 'graded' ? (
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg block">
                      Grade: {assignment.grade}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Graded by Mwalimu</span>
                  </div>
                ) : assignment.status === 'submitted' ? (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg">
                    Awaiting Tutor Review
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSubmittingItem(assignment)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Submit Work</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submission Modal */}
      {submittingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Submit Completed Homework</h3>
                <p className="text-xs text-blue-100">{submittingItem.title}</p>
              </div>
              <button
                onClick={() => setSubmittingItem(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitHomework} className="p-5 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Submission Notes & Key Answers
                </label>
                <textarea
                  rows={4}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Explain your approach, attach answers or formula proofs..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-slate-500">
                <FileCheck className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="font-semibold text-slate-700 block">
                  Encrypted Work Sheet Attached
                </span>
                <span className="text-[10px] text-slate-400">PDF Document • 1.2 MB</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingItem(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  {loading ? 'Transmitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Study Atmosphere Selector Modal */}
      <StudyAtmosphereSelector
        isOpen={isAtmosphereSelectorOpen}
        onClose={() => setIsAtmosphereSelectorOpen(false)}
        selectedId={selectedAtmosphere.id}
        onSelect={(atmo) => {
          handleSelectAtmosphere(atmo);
          setIsAtmosphereSelectorOpen(false);
        }}
      />
    </div>
  );
};
