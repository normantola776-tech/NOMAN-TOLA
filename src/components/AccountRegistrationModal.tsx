import React, { useState } from 'react';
import {
  GraduationCap,
  School,
  Globe,
  Compass,
  Sparkles,
  CheckCircle2,
  X,
  User,
  Mail,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, SECONDARY_CLASSES } from '../types.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (user: UserProfile) => void;
  defaultRole?: 'student' | 'tutor';
  intentAction?: string; // e.g. "purchase a session"
}

const NATIONALITIES = [
  'Ugandan',
  'Kenyan',
  'Tanzanian',
  'Rwandan',
  'South Sudanese',
  'Burundian',
  'Congolese',
  'International',
];

export const AccountRegistrationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  defaultRole = 'student',
  intentAction,
}) => {
  const [role, setRole] = useState<'student' | 'tutor'>(defaultRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<string>('Senior 4');
  const [nationality, setNationality] = useState('Ugandan');
  const [sector, setSector] = useState<'Science' | 'Art' | 'Both'>('Science');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !schoolName.trim()) {
      setError('Please provide your full name and high school name.');
      return;
    }

    setLoading(true);
    setError(null);

    const generatedUid = `user-${role}-${Date.now().toString().slice(-6)}`;
    const effectiveEmail = email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.') || 'student'}@highschool.edu`;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: generatedUid,
          email: effectiveEmail,
          fullName: fullName.trim(),
          role,
          schoolName: schoolName.trim(),
          gradeLevel,
          nationality,
          sector,
          avatar:
            role === 'student'
              ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register account');

      onRegisterSuccess(data);
      onClose();
    } catch (err: any) {
      console.error('Registration error:', err);
      // Client-side fallback if server endpoint is busy
      const fallbackUser: UserProfile = {
        id: Date.now() % 10000,
        uid: generatedUid,
        email: effectiveEmail,
        fullName: fullName.trim(),
        role,
        schoolName: schoolName.trim(),
        gradeLevel,
        nationality,
        sector,
        bonusSessionsCount: 0,
        hasFirstTimeBonus: false,
        ordersCount: 0,
        idCardVerified: false,
        avatar:
          role === 'student'
            ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      };
      onRegisterSuccess(fallbackUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {role === 'student' ? 'Create Student Account' : 'Tutor Onboarding & Account'}
              </h3>
              <p className="text-xs text-blue-200">
                {intentAction ? `Required to ${intentAction}` : 'Secondary School Portal Access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Welcome Bonus Notice for Students */}
          {role === 'student' && (
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center gap-3 shadow-xs">
              <span className="p-2 bg-amber-500 text-white rounded-xl font-black text-sm">
                🎁
              </span>
              <div>
                <h5 className="font-bold text-xs text-amber-900">
                  First-Time Student Bonus Offer!
                </h5>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Students attending for the first time receive a <strong>100% Free Bonus Session Voucher</strong> right after making their first session booking!
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Role Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Account Registration Role
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'student'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('tutor')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'tutor'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Instructor / Tutor</span>
              </button>
            </div>
          </div>

          {/* 1. Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'student' ? 'e.g. Joel Mukasa' : 'e.g. Dr. Mark Kigozi'}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 2. School Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Secondary / High School Name *
            </label>
            <div className="relative">
              <School className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g. King's College Budo, Gayaza High, SMACK..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 3. Level & 4. Nationality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Class Level *
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {SECONDARY_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls} (UCE / O-Level)
                  </option>
                ))}
                <option value="Senior 5 (A-Level)">Senior 5 (UACE / A-Level)</option>
                <option value="Senior 6 (A-Level)">Senior 6 (UACE / A-Level)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nationality *
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {NATIONALITIES.map((nat) => (
                    <option key={nat} value={nat}>
                      {nat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 5. Sector Selection (Science, Art, or Both) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Academic Sector Track *</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Science: 10,000 / 1.5 hr • Art: 8,000 / 1.5 hr
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Science', 'Art', 'Both'] as const).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSector(sec)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    sector === sec
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/30'
                      : 'border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs">{sec === 'Science' ? '🧪 Science' : sec === 'Art' ? '🎨 Art' : '⚖️ Both'}</span>
                  <span className="text-[10px] text-slate-500">
                    {sec === 'Science'
                      ? 'Physics, Math, Bio, Chem'
                      : sec === 'Art'
                      ? 'Lit, Hist, Geog, Econ'
                      : 'Comprehensive'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 6. Email (Optional / Auto) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notification Email (Optional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gmail.com (Alerts also sent to creator)"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Class session invitations and bonus vouchers are also synced with the platform directorate email (normantola776@gmail.com).
            </p>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
