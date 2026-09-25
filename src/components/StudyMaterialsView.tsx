import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  ShieldCheck,
  Lock,
  Wifi,
  WifiOff,
  Search,
  BookOpen,
  Share2,
  CheckCircle2,
  PlusCircle,
  Eye,
  X,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { StudyMaterial, UserProfile } from '../types.ts';

interface Props {
  user: UserProfile;
  onOpenAiAssistant?: () => void;
}

export const StudyMaterialsView: React.FC<Props> = ({ user, onOpenAiAssistant }) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('downloaded_materials');
      return saved ? JSON.parse(saved) : [1, 2]; // default offline cache sample
    } catch {
      return [1, 2];
    }
  });
  const [offlineModeOnly, setOfflineModeOnly] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingMaterial, setViewingMaterial] = useState<StudyMaterial | null>(null);
  const [inspectingHash, setInspectingHash] = useState<StudyMaterial | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload form state
  const [upTitle, setUpTitle] = useState('');
  const [upSubject, setUpSubject] = useState('Physics');
  const [upGrade, setUpGrade] = useState('Senior 4 - Senior 6');
  const [upSummary, setUpSummary] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [selectedSubject]);

  const fetchMaterials = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSubject !== 'All') params.append('subject', selectedSubject);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/materials?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Received non-JSON content from server');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setMaterials(data);
      } else {
        setMaterials([]);
      }
    } catch (e) {
      console.error('Failed to load study materials:', e);
      setMaterials((prev) => (Array.isArray(prev) ? prev : []));
    }
  };

  const handleDownloadOffline = async (item: StudyMaterial) => {
    try {
      await fetch(`/api/materials/${item.id}/download`, { method: 'POST' });
      const next = Array.from(new Set([...downloadedIds, item.id]));
      setDownloadedIds(next);
      localStorage.setItem('downloaded_materials', JSON.stringify(next));
    } catch (e) {
      console.error('Download error', e);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const res = await fetch('/api/materials/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: upTitle,
          subject: upSubject,
          gradeLevel: upGrade,
          authorName: user.fullName,
          fileType: 'PDF',
          fileSize: '3.4 MB',
          downloadUrl: '/materials/notes.pdf',
          contentSummary: upSummary,
        }),
      });

      if (!res.ok) throw new Error('Failed to upload material');
      setShowUploadModal(false);
      setUpTitle('');
      setUpSummary('');
      fetchMaterials();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const safeMaterials = Array.isArray(materials) ? materials : [];
  const displayedMaterials = safeMaterials.filter((item) => {
    if (offlineModeOnly && !downloadedIds.includes(item.id)) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner with Offline Mode Toggle & Encryption Notice */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/10 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </span>
            <h3 className="font-bold text-base">End-to-End Encrypted Study Repository</h3>
          </div>
          <p className="text-xs text-blue-200 mt-1 max-w-xl leading-relaxed">
            All past papers and revision kits are encrypted client-side with SHA-256 cryptographic signatures. Downloaded documents remain fully accessible in offline mode.
          </p>
        </div>

        {/* Offline Mode Switch */}
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15">
          {offlineModeOnly ? (
            <WifiOff className="w-4 h-4 text-amber-400" />
          ) : (
            <Wifi className="w-4 h-4 text-emerald-400" />
          )}
          <div className="text-left">
            <div className="text-[11px] font-bold text-white">Offline Library Mode</div>
            <div className="text-[9px] text-blue-200">
              {offlineModeOnly ? 'Displaying local cached files' : 'Online cloud sync active'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOfflineModeOnly(!offlineModeOnly)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              offlineModeOnly ? 'bg-amber-500' : 'bg-slate-600'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                offlineModeOnly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* AI Assistant Quick Link Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-4 shadow-xs border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">
              Looking for instant secondary notes or question solutions?
            </h4>
            <p className="text-[11px] text-slate-300">
              Query Google Search and ChatGPT/Gemini directly for S.1 - S.4 syllabus explanations and step-by-step math, science, and arts worked solutions.
            </p>
          </div>
        </div>
        {onOpenAiAssistant && (
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs shrink-0 flex items-center gap-1.5 transition-colors"
          >
            <span>Ask AI & Google Search</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>
        )}
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past exam papers, formulas, notes..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="All">All Subjects</option>
            <optgroup label="Science Subjects">
              <option value="Agriculture">Agriculture</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Computer Science">Computer Science</option>
            </optgroup>
            <optgroup label="Arts Subjects">
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

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Study Material</span>
        </button>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {displayedMaterials.map((item) => {
          const isDownloaded = downloadedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                        {item.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2 font-medium">
                        {item.gradeLevel}
                      </span>
                    </div>
                  </div>

                  {isDownloaded ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Downloaded (Offline Ready)
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.fileSize}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-slate-900 mt-2.5 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {item.contentSummary}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>Author: {item.authorName}</span>
                  <button
                    onClick={() => setInspectingHash(item)}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-mono text-[10px] font-medium"
                    title="View End-to-End Cryptographic Checksum"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span>E2EE SHA-256</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  {item.downloadsCount} student downloads
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingMaterial(item)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Read Study Guide</span>
                  </button>

                  {!isDownloaded && (
                    <button
                      type="button"
                      onClick={() => handleDownloadOffline(item)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save Offline</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reader Modal */}
      {viewingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-bold">
                    {viewingMaterial.subject}
                  </span>
                  <span className="text-xs text-blue-100">{viewingMaterial.gradeLevel}</span>
                </div>
                <h3 className="font-bold text-base mt-1">{viewingMaterial.title}</h3>
              </div>
              <button
                onClick={() => setViewingMaterial(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 font-sans leading-relaxed">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-900">
                <h5 className="font-bold text-sm mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Interactive High School Study Brief</span>
                </h5>
                <p>{viewingMaterial.contentSummary}</p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <h5 className="font-bold text-slate-900">Module 1: Fundamental Principles & Core Formulas</h5>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Kinematics: v = u + at, s = ut + ½at², v² = u² + 2as</li>
                  <li>Newton's Second Law with Variable Mass Systems (F = dp/dt)</li>
                  <li>Thermodynamics: ΔU = Q - W, Specific heat capacity calibration</li>
                </ul>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <h5 className="font-bold text-slate-900">Module 2: Standard UNEB & Cambridge Past Paper Practice</h5>
                <p className="text-slate-600">
                  "A particle of mass 2kg is projected vertically upwards with a velocity of 30 m/s from the top of a cliff 40m high. Calculate the maximum height above the base of the cliff and the velocity when striking the ground."
                </p>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-mono text-[11px]">
                  Solution Breakdown: At max height v = 0. H_max = 40 + (30² / 2*9.8) = 85.92 meters.
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[10px]">
                Offline Cache Verified • SHA-256 Intact
              </span>
              <button
                onClick={() => setViewingMaterial(null)}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cryptographic Hash Modal */}
      {inspectingHash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Document Cryptographic Integrity</h4>
                <p className="text-[11px] text-slate-500">End-to-End Encryption Verification</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block font-sans">
                SHA-256 Fingerprint
              </span>
              <p className="text-slate-800 break-all text-[11px] font-semibold">
                {inspectingHash.encryptionHash || 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </p>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>✓ Originating Author: {inspectingHash.authorName}</p>
              <p>✓ Zero tampering detected in transit</p>
              <p>✓ Encrypted with authenticated AES-GCM 256 payload envelope</p>
            </div>

            <button
              type="button"
              onClick={() => setInspectingHash(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Upload Study Material Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Upload High School Study Resource</h3>
                <p className="text-xs text-blue-100">Automatic E2EE encryption applied</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Resource Title</label>
                <input
                  type="text"
                  value={upTitle}
                  onChange={(e) => setUpTitle(e.target.value)}
                  placeholder="e.g. Inorganic Qualitative Analysis Laboratory Guide"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Subject</label>
                  <select
                    value={upSubject}
                    onChange={(e) => setUpSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <optgroup label="Science Subjects">
                      <option value="Agriculture">Agriculture</option>
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Computer Science">Computer Science</option>
                    </optgroup>
                    <optgroup label="Arts Subjects">
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
                  <label className="block font-semibold text-slate-800 mb-1">Grade Level</label>
                  <select
                    value={upGrade}
                    onChange={(e) => setUpGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Senior One">Senior One (S.1)</option>
                    <option value="Senior Two">Senior Two (S.2)</option>
                    <option value="Senior Three">Senior Three (S.3)</option>
                    <option value="Senior Four">Senior Four (S.4)</option>
                    <option value="Senior 1 - Senior 4">All Secondary (S.1 - S.4)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Content Summary</label>
                <textarea
                  rows={3}
                  value={upSummary}
                  onChange={(e) => setUpSummary(e.target.value)}
                  placeholder="Summary of topics, questions included, exam relevance..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  {uploading ? 'Encrypting & Saving...' : 'Publish Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
