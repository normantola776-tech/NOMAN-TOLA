import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  Search,
  BookOpen,
  Calculator,
  ExternalLink,
  Copy,
  Check,
  Globe,
  GraduationCap,
  Download,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  HelpCircle,
  BookmarkPlus,
  RefreshCw,
} from 'lucide-react';
import {
  UserProfile,
  SECONDARY_CLASSES,
  SCIENCE_SUBJECTS,
  ARTS_SUBJECTS,
  SecondaryClass,
} from '../types.ts';

interface Props {
  user: UserProfile;
}

interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

interface AiSearchResponse {
  source: string;
  query: string;
  classLevel?: string;
  subject?: string;
  mode?: string;
  content: string;
  groundingChunks?: GroundingChunk[];
  webSearchQueries?: string[];
}

const QUICK_PROMPTS: Array<{
  classLevel: SecondaryClass;
  subject: string;
  mode: 'notes' | 'solutions';
  label: string;
  query: string;
}> = [
  {
    classLevel: 'Senior Two',
    subject: 'Agriculture',
    mode: 'notes',
    label: 'S.2 Agriculture: Soil Conservation',
    query: 'Explain the biological and physical methods of soil and water conservation on hilly agricultural land in Uganda.',
  },
  {
    classLevel: 'Senior One',
    subject: 'Fine Art',
    mode: 'notes',
    label: 'S.1 Fine Art: Perspective & Still Life',
    query: 'What are the principles of single-point perspective drawing and tonal gradation for still life objects?',
  },
  {
    classLevel: 'Senior Three',
    subject: 'Kiswahili',
    mode: 'solutions',
    label: 'S.3 Kiswahili: Ngeli za Nomino Drill',
    query: 'Taja na ueleze ngeli za nomino A-WA na KI-VI kwa kutoa mifano mitano ya sentensi zenye upatanisho sahihi wa kisarufi.',
  },
  {
    classLevel: 'Senior Four',
    subject: 'Entrepreneurship',
    mode: 'solutions',
    label: 'S.4 Entrepreneurship: UNEB Cash Account',
    query: 'A trader started business with UGX 500,000 cash on 1st March. Bought inventory for 200,000, sold goods for 350,000 cash, paid electricity 30,000. Prepare the Cash Account and calculate the closing balance.',
  },
  {
    classLevel: 'Senior One',
    subject: 'French',
    mode: 'notes',
    label: 'S.1 French: Verbes Réguliers en -ER',
    query: 'Explain the rule for conjugating regular first group verbs ending in -er in the present indicative tense with examples: parler, habiter, and regarder.',
  },
  {
    classLevel: 'Senior Three',
    subject: 'Mathematics',
    mode: 'solutions',
    label: 'S.3 Mathematics: Quadratic Equations',
    query: 'Solve the equation 2x^2 + 7x - 4 = 0 using the quadratic formula, showing all steps and discriminant calculation.',
  },
  {
    classLevel: 'Senior Four',
    subject: 'Physics',
    mode: 'notes',
    label: 'S.4 Physics: Electromagnetic Induction',
    query: 'State Faraday’s law of electromagnetic induction and Lenz’s law, with the formula E = -N(dΦ/dt) and practical applications in transformers.',
  },
  {
    classLevel: 'Senior Two',
    subject: 'Biology',
    mode: 'solutions',
    label: 'S.2 Biology: Enzyme Action Experiment',
    query: 'Describe an experiment to investigate the effect of temperature on salivary amylase activity on starch suspension.',
  },
];

export const AiStudyAssistantView: React.FC<Props> = ({ user }) => {
  const [selectedClass, setSelectedClass] = useState<string>('Senior Four');
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
  const [mode, setMode] = useState<'notes' | 'solutions'>('notes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [useGoogleSearch, setUseGoogleSearch] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AiSearchResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedOffline, setSavedOffline] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allSubjects = [
    'All Subjects',
    ...SCIENCE_SUBJECTS,
    ...ARTS_SUBJECTS,
  ];

  const handleSearch = async (queryText: string = searchQuery, overrideMode?: 'notes' | 'solutions') => {
    const q = queryText.trim();
    if (!q) return;

    setLoading(true);
    setErrorMessage(null);
    setCopied(false);
    setSavedOffline(false);

    try {
      const res = await fetch('/api/study/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          classLevel: selectedClass,
          subject: selectedSubject !== 'All Subjects' ? selectedSubject : undefined,
          mode: overrideMode || mode,
          useGoogleSearch,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch AI study response');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('AI assistant error:', err);
      setErrorMessage(err.message || 'Error reaching AI resource server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.content) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveOffline = () => {
    if (!result) return;
    try {
      const existing = localStorage.getItem('saved_ai_notes') || '[]';
      const parsed = JSON.parse(existing);
      const newEntry = {
        id: `ai-note-${Date.now()}`,
        title: result.query,
        classLevel: result.classLevel || selectedClass,
        subject: result.subject || selectedSubject,
        content: result.content,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('saved_ai_notes', JSON.stringify([newEntry, ...parsed.slice(0, 19)]));
      setSavedOffline(true);
      setTimeout(() => setSavedOffline(false), 2500);
    } catch (e) {
      console.error('Could not save note locally', e);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-lg text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>ChatGPT & Google Search Real-Time Synthesis</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-lg text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                <span>Ugandan School Schemes (Budo, Gayaza, SMACK, Namagunga)</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Secondary Notes & Question Solutions Engine
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Designed strictly for Senior One to Senior Four. Solutions are brief, clear, explanatory, and highly detailed—free of robotic AI filler—derived from Ugandan school standards, NCDC syllabi, and UNEB marking schemes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl border border-white/10 text-slate-200">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px]">Updated Ugandan Resources Grounding</span>
            </div>
          </div>
        </div>

        {/* Secondary Classes Selector (Strictly S.1 - S.4) */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            Class Level:
          </span>
          {SECONDARY_CLASSES.map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                selectedClass === cls
                  ? 'bg-blue-500 text-white shadow-xs font-bold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {cls}
            </button>
          ))}
          <button
            onClick={() => setSelectedClass('Senior One to Senior Four')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              selectedClass === 'Senior One to Senior Four'
                ? 'bg-blue-500 text-white shadow-xs font-bold'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            All Secondary (S.1 - S.4)
          </button>
        </div>
      </div>

      {/* Main Search & Query Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Mode Selector & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setMode('notes')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'notes'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Search Revision Notes</span>
            </button>
            <button
              onClick={() => setMode('solutions')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'solutions'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-purple-600" />
              <span>Solve Question / Problem</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Subject Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-500">Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {allSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Google Search Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                checked={useGoogleSearch}
                onChange={(e) => setUseGoogleSearch(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="font-medium text-slate-700">Live Web Grounding</span>
            </label>
          </div>
        </div>

        {/* Input Text Area & Submit */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            {mode === 'notes'
              ? 'Enter concept, topic, or syllabus theme to fetch notes:'
              : 'Enter homework question, UNEB past paper problem, or numerical exercise:'}
          </label>
          <div className="relative">
            <textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSearch();
                }
              }}
              rows={3}
              placeholder={
                mode === 'notes'
                  ? `e.g. "Methods of crop propagation and grafting in ${selectedClass} Agriculture" or "Still life shading principles in Fine Art"...`
                  : `e.g. "Calculate the depreciation on farm machinery bought at UGX 2,500,000 using reducing balance method..."`
              }
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 placeholder-slate-400 font-medium resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>Press <strong>Ctrl+Enter</strong> to search instantly</span>
            </p>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !searchQuery.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Researching via Google & AI...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>
                    {mode === 'notes' ? 'Fetch Verified Notes' : 'Solve Step-by-Step'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Example Prompts */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
            Quick Example Searches ({selectedClass}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedClass(qp.classLevel);
                  setSelectedSubject(qp.subject);
                  setMode(qp.mode);
                  setSearchQuery(qp.query);
                  handleSearch(qp.query, qp.mode);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-[11px] font-medium transition-colors text-left flex items-center gap-1"
              >
                <span>{qp.label}</span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h4 className="font-bold text-sm text-slate-800">
            Querying Google Search & ChatGPT/Gemini Knowledge Base...
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Synthesizing secondary syllabus standards for {selectedClass}, analyzing UNEB exam guidelines, and building step-by-step explanations.
          </p>
        </div>
      )}

      {/* Output Results Panel */}
      {result && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
          {/* Output Header */}
          <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">
                {result.classLevel || selectedClass}
              </span>
              {result.subject && (
                <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg text-xs font-bold">
                  {result.subject}
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">
                {result.mode === 'solutions' ? 'Worked Solution' : 'Revision Notes'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSaveOffline}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                {savedOffline ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Saved to Offline!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Save to Study Hub</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Content */}
          <div className="p-6">
            <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-700">
              <Markdown>{result.content}</Markdown>
            </div>

            {/* Google Search Grounding Sources */}
            {result.groundingChunks && result.groundingChunks.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Google Search Grounding References & Verified Links:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.groundingChunks.map((chunk, index) => {
                    const uri = chunk.web?.uri;
                    const title = chunk.web?.title || uri || `Source ${index + 1}`;
                    if (!uri) return null;
                    return (
                      <a
                        key={index}
                        href={uri}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 flex items-center justify-between text-xs transition-colors group"
                      >
                        <span className="font-semibold text-blue-700 group-hover:underline truncate max-w-[280px]">
                          {title}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
