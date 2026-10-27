import React, { useState, useEffect } from 'react';
import {
  Search,
  Star,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  MessageSquare,
  Sparkles,
  Filter,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Tutor, UserProfile, isScienceSubject, OFFICIAL_PAYMENT_CONFIG, DEFAULT_TUTORS } from '../types.ts';

interface Props {
  user: UserProfile;
  onSelectTutorToChat: (tutor: Tutor) => void;
  onBookSession: (tutor: Tutor) => void;
  onRequestRegister?: () => void;
}

const SUBJECT_CATEGORIES = [
  'All',
  'Agriculture',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Fine Art',
  'Kiswahili',
  'Entrepreneurship',
  'French',
  'Literature',
  'Economics',
  'History',
  'Geography',
];

export const TutorCatalog: React.FC<Props> = ({
  user,
  onSelectTutorToChat,
  onBookSession,
  onRequestRegister,
}) => {
  // Pre-populate with verified high-school tutors for instant loading & resilience
  const [tutors, setTutors] = useState<Tutor[]>(DEFAULT_TUTORS);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [expertiseQuery, setExpertiseQuery] = useState('');
  const [minRating, setMinRating] = useState<number>(0);

  // Review Modal state & feedback toast
  const [reviewingTutor, setReviewingTutor] = useState<Tutor | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewToast, setReviewToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchTutors();
  }, [selectedSubject, minRating]);

  // Resilient fetch with automatic single retry
  const fetchWithRetry = async (url: string, retries = 2, delayMs = 400): Promise<Response> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url);
        return response;
      } catch (err) {
        if (attempt === retries - 1) throw err;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw new Error('Network request timeout');
  };

  const getFilteredFallback = () => {
    return DEFAULT_TUTORS.filter((t) => {
      if (selectedSubject !== 'All' && !t.subjects.toLowerCase().includes(selectedSubject.toLowerCase())) {
        return false;
      }
      if (minRating > 0 && t.rating < minRating * 10) {
        return false;
      }
      if (
        expertiseQuery.trim() &&
        !t.academicExpertise.toLowerCase().includes(expertiseQuery.toLowerCase()) &&
        !t.fullName.toLowerCase().includes(expertiseQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  };

  const fetchTutors = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (selectedSubject !== 'All') params.append('subject', selectedSubject);
      if (minRating > 0) params.append('minRating', minRating.toString());
      if (expertiseQuery.trim()) params.append('expertise', expertiseQuery.trim());

      const res = await fetchWithRetry(`/api/tutors?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Received non-JSON content from server');
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setTutors(data);
      } else if (Array.isArray(data)) {
        setTutors(data);
      } else {
        setTutors(getFilteredFallback());
      }
    } catch (e: any) {
      // Graceful fallback to verified tutor cache without fatal console error
      console.warn('Network sync notice in TutorCatalog, using verified high school faculty cache:', e?.message || e);
      setTutors(getFilteredFallback());
      setLoadError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTutors();
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingTutor || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/tutors/${reviewingTutor.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          studentName: user.fullName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to submit review');
      }

      const tutorName = reviewingTutor.fullName;
      setReviewingTutor(null);
      setReviewComment('');
      setReviewToast({
        message: `Thank you! Rating & review recorded for ${tutorName}.`,
        type: 'success',
      });
      setTimeout(() => setReviewToast(null), 4000);
      fetchTutors();
    } catch (err: any) {
      setReviewToast({
        message: err.message || 'Could not post rating right now.',
        type: 'error',
      });
      setTimeout(() => setReviewToast(null), 4000);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-5">
      {reviewToast && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border animate-in fade-in ${
            reviewToast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{reviewToast.message}</span>
          <button
            type="button"
            onClick={() => setReviewToast(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Official Pricing Standard & First-Time Student Bonus Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 space-y-2.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>High School Tutoring Standard:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-lg">
              Science: UGX 10,000 / 1 1/2 hr (90 min)
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-lg">
              Arts: UGX 8,000 / 1 1/2 hr (90 min)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-base">🎁</span>
            <span className="text-slate-300">
              <strong>First-Time Student Reward:</strong> Get <strong>1 FREE Bonus Session</strong> credited after your first order!
            </span>
          </div>
          {onRequestRegister && (
            <button
              type="button"
              onClick={onRequestRegister}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] rounded-lg transition-all cursor-pointer"
            >
              Register Account
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3.5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={expertiseQuery}
              onChange={(e) => setExpertiseQuery(e.target.value)}
              placeholder="Search academic expertise (e.g. Calculus, Electromagnetism, Genetics)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value={0}>Any Rating</option>
              <option value={4.5}>4.5★ and above</option>
              <option value={4.8}>4.8★ Top Rated</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Subject Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SUBJECT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedSubject(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubject === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tutor Cards Grid */}
      {loadError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-800">
          <span>{loadError}</span>
          <button
            onClick={fetchTutors}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading high school certified tutors...
        </div>
      ) : !Array.isArray(tutors) || tutors.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-semibold text-sm text-slate-800">No tutors found</h4>
          <p className="text-xs text-slate-500 mt-1">Try resetting the subject or rating filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(tutors) ? tutors : []).map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Tutor Profile Header */}
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={tutor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={tutor.fullName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    />
                    {tutor.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full ring-2 ring-white">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {tutor.fullName}
                      </h4>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/70">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span className="text-xs font-bold text-amber-800">
                          {(tutor.rating / 10).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {tutor.schoolName}
                    </p>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-400">
                        ({tutor.reviewsCount} reviews)
                      </span>
                      {tutor.idCardVerified && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          ID Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subjects & Expertise */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    {tutor.subjects.split(',').map((subj, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-semibold"
                      >
                        {subj.trim()}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                    <strong className="text-slate-800">Focus:</strong> {tutor.academicExpertise}
                  </p>
                  {tutor.bio && (
                    <p className="text-[11px] text-slate-500 line-clamp-2">{tutor.bio}</p>
                  )}
                </div>
              </div>

              {/* Pricing and Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rate</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm ${
                        isScienceSubject(tutor.subjects)
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isScienceSubject(tutor.subjects) ? 'Science' : 'Arts'}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    UGX {tutor.hourlyRate.toLocaleString()} / hr
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectTutorToChat(tutor)}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Direct Message"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewingTutor(tutor)}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Rate Tutor"
                  >
                    <Star className="w-4 h-4 text-amber-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onBookSession(tutor)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    Book Class
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewingTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Rate & Review Tutor</h3>
                <p className="text-xs text-blue-100">{reviewingTutor.fullName}</p>
              </div>
              <button
                onClick={() => setReviewingTutor(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-5 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Your Feedback & Comment</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share how the tutor helped in this subject, exam tips, clarity of explanations..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingTutor(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  {submittingReview ? 'Submitting...' : 'Post Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
