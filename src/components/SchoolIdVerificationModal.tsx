import React, { useState } from 'react';
import { ShieldCheck, Upload, Camera, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { UserProfile } from '../types.ts';

interface Props {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onVerified: (updatedUser: UserProfile) => void;
}

const SAMPLE_ID_CARDS = [
  {
    name: "King's College Budo - S.4 Student ID",
    url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
    school: "King's College Budo",
    grade: "Senior 4 (Grade 10)",
  },
  {
    name: "Mt. St. Mary's Namagunga - A-Level Card",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    school: "Mt. St. Mary's College Namagunga",
    grade: "Senior 5 (Grade 11)",
  },
  {
    name: "St. Mary's College Kisubi - High School ID",
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
    school: "St. Mary's College Kisubi",
    grade: "Senior 6 (Grade 12)",
  },
];

export const SchoolIdVerificationModal: React.FC<Props> = ({
  user,
  isOpen,
  onClose,
  onVerified,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>(user.schoolName || "King's College Budo");
  const [gradeLevel, setGradeLevel] = useState<string>(user.gradeLevel || "Senior 4 (Grade 10)");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const photoUrl = customPhotoUrl || SAMPLE_ID_CARDS[selectedPreset].url;
      const res = await fetch('/api/auth/verify-id-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          idCardPhotoUrl: photoUrl,
          schoolName,
          gradeLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      onVerified(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Verification could not be processed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local preview blob
      const url = URL.createObjectURL(file);
      setCustomPhotoUrl(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Student School ID Verification</h3>
              <p className="text-xs text-blue-100">Protecting student privacy & identity safety</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-3 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong>High School Privacy Standard:</strong> Only your verified school name and grade level will be displayed. Your ID card photo is encrypted and used solely for student safety verification.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">School Name</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              placeholder="e.g. King's College Budo"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">Grade / Class Level</label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            >
              <option value="Senior 1 (Grade 7)">Senior 1 (Grade 7)</option>
              <option value="Senior 2 (Grade 8)">Senior 2 (Grade 8)</option>
              <option value="Senior 3 (Grade 9)">Senior 3 (Grade 9)</option>
              <option value="Senior 4 (Grade 10)">Senior 4 (Grade 10 - O Level)</option>
              <option value="Senior 5 (Grade 11)">Senior 5 (Grade 11 - A Level)</option>
              <option value="Senior 6 (Grade 12)">Senior 6 (Grade 12 - A Level Candidate)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              Select or Upload High School Student ID Card Photo
            </label>
            <div className="grid grid-cols-3 gap-2.5 mb-3">
              {SAMPLE_ID_CARDS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(idx);
                    setCustomPhotoUrl('');
                    setSchoolName(item.school);
                    setGradeLevel(item.grade);
                  }}
                  className={`relative rounded-xl border-2 overflow-hidden text-left p-1 transition-all ${
                    !customPhotoUrl && selectedPreset === idx
                      ? 'border-blue-600 ring-2 ring-blue-200 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 opacity-80'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-16 object-cover rounded-lg"
                  />
                  <p className="text-[10px] font-medium text-slate-700 mt-1 truncate px-1">
                    {item.school.split(' ')[0]}
                  </p>
                </button>
              ))}
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSimulate}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                  <Camera className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-slate-700">
                  {customPhotoUrl ? 'Custom ID Card Attached ✓' : 'Click or Drag to Upload Your ID Card Photo'}
                </p>
                <p className="text-[11px] text-slate-400">JPEG, PNG or WebP up to 10MB</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 font-medium text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleVerify}
            disabled={submitting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Verifying...' : 'Verify School Identity'}
          </button>
        </div>
      </div>
    </div>
  );
};
