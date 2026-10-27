import React, { useState, useEffect } from 'react';
import {
  Video,
  Mic,
  Calendar,
  Clock,
  Lock,
  Unlock,
  Play,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  CreditCard,
  Building2,
  X,
  Smartphone,
  BookOpen,
} from 'lucide-react';
import {
  TutoringSession,
  UserProfile,
  OFFICIAL_PAYMENT_CONFIG,
  isScienceSubject,
  getSubjectTrack,
  calculateSessionPrice,
} from '../types.ts';

interface Props {
  user: UserProfile;
  onPaySession: (session: TutoringSession) => void;
  onEnterClassroom: (session: TutoringSession) => void;
  onRequestRegister?: () => void;
  paidSessionIds: number[];
}

export const SpecialSessionsList: React.FC<Props> = ({
  user,
  onPaySession,
  onEnterClassroom,
  onRequestRegister,
  paidSessionIds,
}) => {
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [trackFilter, setTrackFilter] = useState<'All' | 'Science' | 'Arts'>('All');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New session form
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Physics');
  const [newClassLevel, setNewClassLevel] = useState<string>('Senior Four');
  const [newPrice, setNewPrice] = useState('10000');
  const [newDuration, setNewDuration] = useState('60');
  const [newOverview, setNewOverview] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [classFilter]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (classFilter !== 'All') {
        params.append('classLevel', classFilter);
      }
      const res = await fetch(`/api/sessions?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Received non-JSON content from server');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setSessions(data);
      } else {
        setSessions([]);
      }
    } catch (e: any) {
      console.warn('Network sync notice in SpecialSessionsList:', e?.message || e);
      setSessions((prev) => (Array.isArray(prev) ? prev : []));
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (subject: string, durationStr: string = newDuration) => {
    setNewSubject(subject);
    const duration = parseInt(durationStr, 10) || 60;
    const computedPrice = calculateSessionPrice(subject, duration);
    setNewPrice(computedPrice.toString());
  };

  const handleDurationChange = (durationStr: string) => {
    setNewDuration(durationStr);
    const duration = parseInt(durationStr, 10) || 60;
    const computedPrice = calculateSessionPrice(newSubject, duration);
    setNewPrice(computedPrice.toString());
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          subject: newSubject,
          classLevel: newClassLevel,
          tutorId: user.role === 'tutor' ? user.id : 1,
          scheduledAt: new Date(Date.now() + 3600000 * 3).toISOString(),
          durationMinutes: parseInt(newDuration, 10),
          price: parseInt(newPrice, 10),
          syllabusOverview: newOverview,
          hasVideo: true,
          hasAudio: true,
        }),
      });

      if (!res.ok) throw new Error('Failed to create session');
      setShowCreateModal(false);
      setNewTitle('');
      setNewOverview('');
      fetchSessions();
    } catch (err: any) {
      alert(err.message || 'Error creating session');
    } finally {
      setCreating(false);
    }
  };

  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const filteredSessions = safeSessions.filter((s) => {
    if (trackFilter !== 'All') {
      const isSci = isScienceSubject(s.subject);
      if (trackFilter === 'Science' && !isSci) return false;
      if (trackFilter === 'Arts' && isSci) return false;
    }
    if (classFilter !== 'All' && s.classLevel && s.classLevel !== classFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            <span>Special Live Video & Audio Tutoring Sessions</span>
          </h3>
          <p className="text-xs text-slate-500">
            Interactive high school masterclasses. Secured access upon payment verification.
          </p>
        </div>

        {user.role === 'tutor' && (
          <button
            onClick={() => {
              handleSubjectChange('Physics');
              setShowCreateModal(true);
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Special Session</span>
          </button>
        )}
      </div>

      {/* Official Rates & Payments Transparency Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 space-y-2.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Official High School Lesson Pricing Standard:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-lg text-[11px] font-bold">
              Science Sessions: UGX 10,000 per 1 1/2 hr
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-lg text-[11px] font-bold">
              Arts Sessions: UGX 8,000 per 1 1/2 hr
            </span>
          </div>
        </div>

        {/* First-Time Student Bonus Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-400/30 rounded-xl p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🎁</span>
            <div>
              <span className="font-bold text-amber-300 block text-xs">
                First-Time Student Bonus Offer
              </span>
              <span className="text-[11px] text-slate-300">
                First-time students receive <strong>1 FREE Bonus 1 1/2 hr Session</strong> automatically after their first session booking!
              </span>
            </div>
          </div>
          {onRequestRegister && (
            <button
              type="button"
              onClick={onRequestRegister}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] rounded-lg transition-all shrink-0 cursor-pointer"
            >
              Create Student Account
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-400">MTN Line:</span>
              <span className="font-mono font-bold text-amber-300">
                {OFFICIAL_PAYMENT_CONFIG.mtnNumber}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-slate-400">Airtel Line:</span>
              <span className="font-mono font-bold text-red-300">
                {OFFICIAL_PAYMENT_CONFIG.airtelNumber}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-slate-400">Centenary Bank:</span>
              <span className="font-mono font-semibold text-blue-200">
                {OFFICIAL_PAYMENT_CONFIG.centenaryAccount}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 hidden md:inline">
            Direct notification transmitted to normantola776@gmail.com
          </span>
        </div>
      </div>

      {/* Track & Secondary Class Filter Navigation */}
      <div className="space-y-2">
        {/* Secondary School Classes (S.1 - S.4 strictly, no A-Level) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Class Level:
          </span>
          {['All', 'Senior One', 'Senior Two', 'Senior Three', 'Senior Four'].map((cls) => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                classFilter === cls
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cls === 'All' ? 'All O-Level Classes' : cls}
            </button>
          ))}
        </div>

        {/* Subject Track Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTrackFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              trackFilter === 'All'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Tracks ({sessions.length})
          </button>
          <button
            onClick={() => setTrackFilter('Science')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              trackFilter === 'Science'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Science Sessions (UGX 10,000 / 1 1/2 hr)
          </button>
          <button
            onClick={() => setTrackFilter('Arts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              trackFilter === 'Arts'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Arts Sessions (UGX 8,000 / 1 1/2 hr)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading interactive tutoring sessions...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <p className="text-xs text-slate-500">No scheduled sessions matching filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session) => {
            const isPaid = paidSessionIds.includes(session.id) || user.role === 'tutor' || user.role === 'creator';
            const isSci = isScienceSubject(session.subject);
            const track = isSci ? 'Science' : 'Arts';
            const standardRate = isSci ? OFFICIAL_PAYMENT_CONFIG.scienceHourlyRate : OFFICIAL_PAYMENT_CONFIG.artsHourlyRate;

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {session.subject}
                      </span>
                      {session.classLevel && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {session.classLevel}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isSci
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {track} • UGX {session.price.toLocaleString()} / 1 1/2 hr
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {session.durationMinutes} mins
                      </span>
                    </div>

                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Unlock className="w-3 h-3 text-emerald-600" />
                        Room Pass Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Lock className="w-3 h-3 text-amber-600" />
                        Requires Payment
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mt-2.5 leading-snug">
                    {session.title}
                  </h4>

                  {session.syllabusOverview && (
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {session.syllabusOverview}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={session.tutorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt="Tutor"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-medium text-slate-700">{session.tutorName}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Video className="w-3.5 h-3.5 text-blue-500" />
                      <span>HD Video</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Mic className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Live Audio</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      Fee ({session.durationMinutes} mins)
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      UGX {session.price.toLocaleString()}
                    </span>
                  </div>

                  {isPaid ? (
                    <button
                      type="button"
                      onClick={() => onEnterClassroom(session)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Enter Live Room</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onPaySession(session)}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Unlock with MTN / Airtel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Special Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Schedule Special Masterclass</h3>
                <p className="text-xs text-blue-100">Live Video & Audio Session</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Session Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Masterclass: Vectors & 3D Geometry in Physics"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Class Level</label>
                  <select
                    value={newClassLevel}
                    onChange={(e) => setNewClassLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Senior One">Senior One (S.1)</option>
                    <option value="Senior Two">Senior Two (S.2)</option>
                    <option value="Senior Three">Senior Three (S.3)</option>
                    <option value="Senior Four">Senior Four (S.4)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <optgroup label="Science Lessons (UGX 10,000/hr)">
                      <option value="Agriculture">Agriculture</option>
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Computer Science">Computer Science</option>
                    </optgroup>
                    <optgroup label="Arts Sessions (UGX 8,000/hr)">
                      <option value="Fine Art">Fine Art</option>
                      <option value="Kiswahili">Kiswahili</option>
                      <option value="Entrepreneurship">Entrepreneurship</option>
                      <option value="French">French</option>
                      <option value="Literature">Literature</option>
                      <option value="Economics">Economics</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Fee (UGX)
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {isScienceSubject(newSubject) ? '10,000/hr policy' : '8,000/hr policy'}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Minutes</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Syllabus & Topics Covered</label>
                <textarea
                  rows={3}
                  value={newOverview}
                  onChange={(e) => setNewOverview(e.target.value)}
                  placeholder="Key concepts, exam papers to review..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-[11px] space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Settlement Policy & Gateway Information</span>
                </div>
                <p className="text-[10px] text-blue-800">
                  Payments received via MTN ({OFFICIAL_PAYMENT_CONFIG.mtnNumber}) and Airtel ({OFFICIAL_PAYMENT_CONFIG.airtelNumber}).
                  75% automatically disbursed to tutor earnings; 20% creator net; 5% URA withholding tax.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  {creating ? 'Scheduling...' : 'Publish Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
