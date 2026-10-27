import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  ThumbsUp,
  DollarSign,
  Plus,
  CheckCircle2,
  Lock,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Building2,
  Trash2,
  Edit2,
  Video,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import {
  UserProfile,
  TutoringSession,
  TimetableSlot,
  OFFICIAL_PAYMENT_CONFIG,
  calculateSessionPrice,
} from '../types.ts';

interface Props {
  user: UserProfile;
  onEnterClassroom?: (session: TutoringSession) => void;
  onTriggerNotification?: (title: string, message: string, type: 'session' | 'assignment' | 'grade') => void;
}

const DEFAULT_TIMETABLE: TimetableSlot[] = [
  {
    id: 'tt-1',
    day: 'Monday',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    durationMinutes: 90,
    subject: 'Physics',
    classLevel: 'Senior 4',
    sector: 'Science',
    lessonTopic: 'Electromagnetic Induction & Faradays Law',
    status: 'scheduled',
  },
  {
    id: 'tt-2',
    day: 'Wednesday',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    durationMinutes: 90,
    subject: 'Mathematics',
    classLevel: 'Senior 4',
    sector: 'Science',
    lessonTopic: 'Differential Calculus & Stationary Points',
    status: 'scheduled',
  },
  {
    id: 'tt-3',
    day: 'Friday',
    startTime: '04:00 PM',
    endTime: '05:30 PM',
    durationMinutes: 90,
    subject: 'Literature',
    classLevel: 'Senior 4',
    sector: 'Art',
    lessonTopic: 'East African Prose: The River Between Themes',
    status: 'scheduled',
  },
  {
    id: 'tt-4',
    day: 'Saturday',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    durationMinutes: 90,
    subject: 'Chemistry',
    classLevel: 'Senior 4',
    sector: 'Science',
    lessonTopic: 'Quantitative Volumetric Practical Analysis',
    status: 'scheduled',
  },
];

export const TutorWorkspaceView: React.FC<Props> = ({
  user,
  onEnterClassroom,
  onTriggerNotification,
}) => {
  const [timetable, setTimetable] = useState<TimetableSlot[]>(DEFAULT_TIMETABLE);
  const [sessionsTaught, setSessionsTaught] = useState<TutoringSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  // New timetable entry form state
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [slotDay, setSlotDay] = useState<TimetableSlot['day']>('Monday');
  const [slotStart, setSlotStart] = useState('10:00 AM');
  const [slotEnd, setSlotEnd] = useState('11:30 AM');
  const [slotSubject, setSlotSubject] = useState('Physics');
  const [slotLevel, setSlotLevel] = useState('Senior 4');
  const [slotSector, setSlotSector] = useState<'Science' | 'Art'>('Science');
  const [slotTopic, setSlotTopic] = useState('');

  useEffect(() => {
    fetchTaughtSessions();
  }, [user.id]);

  const fetchTaughtSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tutor/sessions?tutorId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSessionsTaught(data);
          return;
        }
      }
      // Fallback data
      setSessionsTaught([
        {
          id: 1,
          title: 'Physics: Electromagnetic Induction & Alternating Current',
          subject: 'Physics',
          sector: 'Science',
          tutorId: user.id || 1,
          scheduledAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          durationMinutes: 90,
          price: 10000,
          sessionType: 'special_session',
          status: 'completed',
          meetingRoomId: 'room-phys-401',
          hasVideo: true,
          hasAudio: true,
          classLevel: 'Senior 4',
          likesCount: 6,
          earnedPayout: false,
        },
        {
          id: 3,
          title: 'Mathematics: Differential Calculus & Curve Sketching',
          subject: 'Mathematics',
          sector: 'Science',
          tutorId: user.id || 1,
          scheduledAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          durationMinutes: 90,
          price: 10000,
          sessionType: 'special_session',
          status: 'completed',
          meetingRoomId: 'room-math-303',
          hasVideo: true,
          hasAudio: true,
          classLevel: 'Senior 4',
          likesCount: 9,
          earnedPayout: true,
        },
        {
          id: 4,
          title: 'Literature: Analysis of The River Between & East African Prose',
          subject: 'Literature',
          sector: 'Art',
          tutorId: user.id || 1,
          scheduledAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
          durationMinutes: 90,
          price: 8000,
          sessionType: 'special_session',
          status: 'completed',
          meetingRoomId: 'room-lit-501',
          hasVideo: true,
          hasAudio: true,
          classLevel: 'Senior 4',
          likesCount: 0, // Zero likes: earn button disabled until student clicks like
          earnedPayout: false,
        },
      ]);
    } catch (e: any) {
      console.warn('Network sync notice in TutorWorkspaceView:', e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotTopic.trim()) return;

    const newSlot: TimetableSlot = {
      id: `tt-${Date.now()}`,
      day: slotDay,
      startTime: slotStart,
      endTime: slotEnd,
      durationMinutes: 90,
      subject: slotSubject,
      classLevel: slotLevel,
      sector: slotSector,
      lessonTopic: slotTopic.trim(),
      status: 'scheduled',
    };

    setTimetable((prev) => [...prev, newSlot]);
    setIsAddingSlot(false);
    setSlotTopic('');

    onTriggerNotification?.(
      'Timetable Updated 📅',
      `New ${slotSubject} lesson (${slotStart} - ${slotEnd}) added to your teaching schedule.`,
      'session'
    );
  };

  const handleDeleteSlot = (id: string) => {
    setTimetable((prev) => prev.filter((s) => s.id !== id));
  };

  // Simulate or record student like
  const handleSimulateStudentLike = async (sessionId: number) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: 'Joel Mukasa (Student)' }),
      });
      const data = await res.json();
      setSessionsTaught((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, likesCount: (s.likesCount || 0) + 1 } : s
        )
      );
      onTriggerNotification?.(
        'Student Liked Your Session! ❤️',
        'A student verified that this session was very helpful! Your Earn Button is now unlocked.',
        'session'
      );
    } catch (e) {
      // Local update
      setSessionsTaught((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, likesCount: (s.likesCount || 0) + 1 } : s
        )
      );
    }
  };

  // Claim Earnings action
  const handleClaimEarnings = async (session: TutoringSession) => {
    if (!session.likesCount || session.likesCount === 0) {
      alert('The Earn button is locked! Attending students must first press their Like buttons during the session to confirm the lesson was helpful.');
      return;
    }

    setClaimingId(session.id);
    try {
      const amount = session.price || (session.sector === 'Art' ? 8000 : 10000);
      const res = await fetch('/api/tutor/claim-earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          tutorId: user.id,
          tutorName: user.fullName,
          amount,
          subject: session.subject,
          sector: session.sector,
          likesCount: session.likesCount,
        }),
      });

      const data = await res.json();
      setSessionsTaught((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, earnedPayout: true } : s))
      );

      onTriggerNotification?.(
        'Payout Approved! 💰',
        `UGX ${amount.toLocaleString()} disbursed to your Mobile Money / Centenary account. Email receipt dispatched to normantola776@gmail.com.`,
        'grade'
      );

      alert(
        `🎉 Earnings Claimed Successfully!\n\nAmount: UGX ${amount.toLocaleString()}\nSession: ${session.title}\nStudent Helpfulness Likes: ${session.likesCount}\nDestination: Centenary Bank / MTN MoMo\nAudit Email Dispatched: ${OFFICIAL_PAYMENT_CONFIG.notificationEmail}`
      );
    } catch (err: any) {
      alert(err.message || 'Error processing earnings claim');
    } finally {
      setClaimingId(null);
    }
  };

  // Calculations
  const totalMinutesTaught = sessionsTaught.reduce((acc, s) => acc + (s.durationMinutes || 90), 0);
  const totalHoursTaught = (totalMinutesTaught / 60).toFixed(1);
  const totalLikes = sessionsTaught.reduce((acc, s) => acc + (s.likesCount || 0), 0);
  const claimedEarnings = sessionsTaught
    .filter((s) => s.earnedPayout)
    .reduce((acc, s) => acc + (s.price || (s.sector === 'Art' ? 8000 : 10000)), 0);
  const pendingEarnings = sessionsTaught
    .filter((s) => !s.earnedPayout && (s.likesCount || 0) > 0)
    .reduce((acc, s) => acc + (s.price || (s.sector === 'Art' ? 8000 : 10000)), 0);

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner: Tutor Identification & Rate Standards */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
              alt={user.fullName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">{user.fullName}</h2>
                <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 border border-blue-400/40 rounded-full text-[10px] font-bold uppercase">
                  Verified Tutor
                </span>
              </div>
              <p className="text-xs text-blue-200">
                {user.schoolName} • {user.gradeLevel || 'Senior 1 - Senior 6 (A-Level)'}
              </p>
              <p className="text-[11px] text-blue-300/80 mt-0.5">
                Nationality: {user.nationality || 'Ugandan'} • Sector: {user.sector || 'Science & Art'}
              </p>
            </div>
          </div>

          {/* Pricing Standard Policy Card */}
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 text-xs space-y-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
              Official Session Rate Standards
            </span>
            <div className="flex items-center justify-between gap-4 font-semibold text-white">
              <span>🧪 Science (1 1/2 hr):</span>
              <span className="font-mono text-emerald-300">UGX 10,000</span>
            </div>
            <div className="flex items-center justify-between gap-4 font-semibold text-white">
              <span>🎨 Arts (1 1/2 hr):</span>
              <span className="font-mono text-emerald-300">UGX 8,000</span>
            </div>
          </div>
        </div>

        {/* Aggregate Stats Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-1.5 text-blue-300 text-[11px] font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Time Spent Teaching</span>
            </div>
            <span className="text-lg font-black text-white">{totalHoursTaught} hrs</span>
            <span className="text-[10px] text-slate-300 block">({totalMinutesTaught} total mins)</span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-semibold mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lessons Taught</span>
            </div>
            <span className="text-lg font-black text-white">{sessionsTaught.length}</span>
            <span className="text-[10px] text-slate-300 block">Classes completed</span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-1.5 text-rose-300 text-[11px] font-semibold mb-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Student Likes</span>
            </div>
            <span className="text-lg font-black text-white">{totalLikes}</span>
            <span className="text-[10px] text-slate-300 block">Helpfulness votes</span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-semibold mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Available to Claim</span>
            </div>
            <span className="text-lg font-black text-white">
              UGX {pendingEarnings.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-300 block">
              Claimed: UGX {claimedEarnings.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: TIMETABLE & PROGRAM SCHEDULING */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>My Teaching Timetable & Lesson Programs</span>
            </h3>
            <p className="text-xs text-slate-500">
              Set and organize your weekly lesson hours for secondary school learners.
            </p>
          </div>

          <button
            onClick={() => setIsAddingSlot(!isAddingSlot)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingSlot ? 'Close Scheduler' : 'Add New Lesson Slot'}</span>
          </button>
        </div>

        {/* Add Slot Form */}
        {isAddingSlot && (
          <form
            onSubmit={handleAddSlot}
            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5 animate-in fade-in"
          >
            <h4 className="font-bold text-xs text-slate-800">Schedule Program / Lesson</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Day of Week</label>
                <select
                  value={slotDay}
                  onChange={(e) => setSlotDay(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                    (d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Time</label>
                <input
                  type="text"
                  value={slotStart}
                  onChange={(e) => setSlotStart(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  End Time (1 1/2 hr)
                </label>
                <input
                  type="text"
                  value={slotEnd}
                  onChange={(e) => setSlotEnd(e.target.value)}
                  placeholder="e.g. 11:30 AM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={slotSubject}
                  onChange={(e) => setSlotSubject(e.target.value)}
                  placeholder="e.g. Physics, Mathematics, Literature"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Class Level</label>
                <select
                  value={slotLevel}
                  onChange={(e) => setSlotLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                >
                  <option value="Senior 1">Senior 1</option>
                  <option value="Senior 2">Senior 2</option>
                  <option value="Senior 3">Senior 3</option>
                  <option value="Senior 4">Senior 4 (O-Level)</option>
                  <option value="Senior 5">Senior 5 (A-Level)</option>
                  <option value="Senior 6">Senior 6 (A-Level)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Sector & Rate
                </label>
                <select
                  value={slotSector}
                  onChange={(e) => setSlotSector(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                >
                  <option value="Science">🧪 Science Track (UGX 10,000 / 1.5 hr)</option>
                  <option value="Art">🎨 Arts Track (UGX 8,000 / 1.5 hr)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Lesson Topic & Syllabus Focus *
              </label>
              <input
                type="text"
                required
                value={slotTopic}
                onChange={(e) => setSlotTopic(e.target.value)}
                placeholder="e.g. Thermodynamics, Coordinate Geometry, UNEB Exam Paper 2 Discussion..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingSlot(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
              >
                Save to Timetable
              </button>
            </div>
          </form>
        )}

        {/* Timetable Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {timetable.map((slot) => (
            <div
              key={slot.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-xs transition-all flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold text-[10px]">
                    {slot.day}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {slot.startTime} - {slot.endTime}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      slot.sector === 'Science'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {slot.sector} • {slot.sector === 'Science' ? 'UGX 10k' : 'UGX 8k'}
                  </span>
                </div>
                <h5 className="font-bold text-xs text-slate-900">{slot.lessonTopic}</h5>
                <p className="text-[11px] text-slate-500">
                  {slot.subject} • {slot.classLevel} • Standard 90 Mins (1 1/2 hr)
                </p>
              </div>

              <button
                onClick={() => handleDeleteSlot(slot.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Remove Slot"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: SESSIONS TAUGHT, TIME SPENT & EARN BUTTON */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Sessions Taught, Time Spent & Student-Verified Earnings</span>
            </h3>
            <p className="text-xs text-slate-500">
              The <strong>Earn Button</strong> is active after students press their Like buttons during the session to confirm the lesson was helpful.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Total Sessions: {sessionsTaught.length}
          </span>
        </div>

        {/* Sessions Taught List */}
        <div className="space-y-3.5">
          {sessionsTaught.map((session) => {
            const hasLikes = (session.likesCount || 0) > 0;
            const isEarned = session.earnedPayout;
            const payoutAmount = session.price || (session.sector === 'Art' ? 8000 : 10000);

            return (
              <div
                key={session.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded-md">
                        {session.subject}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          session.sector === 'Art'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {session.sector || 'Science'} Track • UGX {payoutAmount.toLocaleString()} per 1 1/2 hr
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {session.classLevel || 'Senior 4'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{session.title}</h4>
                  </div>

                  {/* Time Spent & Status */}
                  <div className="text-right sm:self-center shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-900 rounded-xl text-xs font-bold border border-blue-200/60">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Time Spent: {session.durationMinutes || 90} mins (1.5 hr)</span>
                    </div>
                  </div>
                </div>

                {/* Session Description / Syllabus */}
                {session.syllabusOverview && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {session.syllabusOverview}
                  </p>
                )}

                {/* Feedback & EARN BUTTON BAR */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  {/* Student Likes Counter & Helper */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                        hasLikes
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasLikes ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{session.likesCount || 0} Student Likes</span>
                    </div>

                    {!hasLikes && (
                      <button
                        onClick={() => handleSimulateStudentLike(session.id)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer"
                        title="Simulate student pressing like during live lesson"
                      >
                        + Simulate Student Like
                      </button>
                    )}
                  </div>

                  {/* The Earn Button */}
                  <div className="flex items-center gap-2">
                    {isEarned ? (
                      <div className="px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Payout Claimed (UGX {payoutAmount.toLocaleString()})</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!hasLikes || claimingId === session.id}
                        onClick={() => handleClaimEarnings(session)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
                          hasLikes
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-500/20 active:scale-95'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                        title={
                          hasLikes
                            ? 'Claim lesson earnings into your Mobile Money / Centenary account'
                            : 'Locked: Student like required to confirm session was helpful'
                        }
                      >
                        {hasLikes ? (
                          <>
                            <DollarSign className="w-4 h-4" />
                            <span>
                              {claimingId === session.id
                                ? 'Processing Payout...'
                                : `Earn UGX ${payoutAmount.toLocaleString()} (Claim Payout)`}
                            </span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Earn Button Locked (Awaiting Student Like)</span>
                          </>
                        )}
                      </button>
                    )}

                    {onEnterClassroom && (
                      <button
                        onClick={() => onEnterClassroom(session)}
                        className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl border border-slate-200 transition-colors"
                        title="Re-enter Classroom"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
