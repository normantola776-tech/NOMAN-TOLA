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
  Library,
  FileCheck2,
  Award,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  UserProfile,
  SECONDARY_CLASSES,
  SCIENCE_SUBJECTS,
  ARTS_SUBJECTS,
  SecondaryClass,
  CrossSchoolBriefTest,
} from '../types.ts';
import { CROSS_SCHOOL_BRIEF_TESTS } from '../data/crossSchoolTests.ts';

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

const QUICK_SCHOLAR_TOPICS = [
  {
    classLevel: 'Senior Four',
    subject: 'Physics',
    label: 'Faraday & Lenz Law • Nelkon & Parker Library Reference',
    query: 'State and mathematically prove Faraday’s Law of Electromagnetic Induction and Lenz’s Law with step-by-step SI units and transformer equations.',
  },
  {
    classLevel: 'Senior Four',
    subject: 'Mathematics',
    label: 'Calculus Stationary Points • Cambridge Pure Math Ref',
    query: 'Find the coordinates of the turning point of y = 2x^2 - 8x + 11 and determine its nature using second order derivatives.',
  },
  {
    classLevel: 'Senior Four',
    subject: 'Chemistry',
    label: 'Acid-Base Volumetric Analysis • Vogel Quantitative Chemistry',
    query: 'Calculate the concentration of sodium carbonate needed to neutralize 25 cm3 of 0.1 M hydrochloric acid with complete ionic equation.',
  },
  {
    classLevel: 'Senior Four',
    subject: 'Literature',
    label: 'Ngũgĩ Prose Thematic Analysis • East African Literature Library',
    query: 'Analyze the symbolism of the Honia river and the rivalry of Makuyu and Kameno ridges in Ngugi wa Thiongos The River Between.',
  },
];

export const AiStudyAssistantView: React.FC<Props> = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'scholar-library' | 'brief-tests'>('scholar-library');

  // Scholar Library Solver State
  const [selectedClass, setSelectedClass] = useState<string>('Senior Four');
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
  const [mode, setMode] = useState<'solutions' | 'notes'>('solutions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [useGoogleSearch, setUseGoogleSearch] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AiSearchResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedOffline, setSavedOffline] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Brief Tests State
  const [selectedTest, setSelectedTest] = useState<CrossSchoolBriefTest>(CROSS_SCHOOL_BRIEF_TESTS[0]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submittedTest, setSubmittedTest] = useState(false);

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
        throw new Error('Failed to fetch scholarly response');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Scholar assistant error:', err);
      setErrorMessage(err.message || 'Error reaching academic library server.');
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
      const existing = localStorage.getItem('saved_scholar_notes') || '[]';
      const parsed = JSON.parse(existing);
      const newEntry = {
        id: `scholar-note-${Date.now()}`,
        title: result.query,
        classLevel: result.classLevel || selectedClass,
        subject: result.subject || selectedSubject,
        content: result.content,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('saved_scholar_notes', JSON.stringify([newEntry, ...parsed.slice(0, 19)]));
      setSavedOffline(true);
      setTimeout(() => setSavedOffline(false), 2500);
    } catch (e) {
      console.error('Could not save note locally', e);
    }
  };

  // Brief Test Actions
  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (submittedTest) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    selectedTest.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return {
      score: correct,
      total: selectedTest.questions.length,
      percentage: Math.round((correct / selectedTest.questions.length) * 100),
    };
  };

  const resetTest = (test: CrossSchoolBriefTest) => {
    setSelectedTest(test);
    setUserAnswers({});
    setSubmittedTest(false);
  };

  return (
    <div className="space-y-5 text-slate-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-bold">
                <Library className="w-3.5 h-3.5 text-emerald-300" />
                <span>Google Scholar & Academic Libraries Grounded</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-200 border border-blue-400/30 rounded-xl text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                <span>Budo • Gayaza • SMACK • Namagunga Archives</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Secondary Academic Library & Google Scholar Research Portal
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Academic queries are answered through Google Scholar citations, official curricula (UNEB, Cambridge, NCDC), and archival library marking schemes—minimizing generic AI in favor of verified scholarly references and real cross-school brief tests.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => setActiveSubTab('scholar-library')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'scholar-library'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Library className="w-4 h-4" />
            <span>Google Scholar Library Solver</span>
          </button>
          <button
            onClick={() => setActiveSubTab('brief-tests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'brief-tests'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Cross-School Library Brief Tests</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: GOOGLE SCHOLAR LIBRARY SOLVER */}
      {activeSubTab === 'scholar-library' && (
        <div className="space-y-4">
          {/* Main Search & Query Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            {/* Mode & Subject Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                <button
                  onClick={() => setMode('solutions')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'solutions'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5 text-purple-600" />
                  <span>Scholarly Problem Solver</span>
                </button>
                <button
                  onClick={() => setMode('notes')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'notes'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Library Text Notes</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Subject:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {allSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Input */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <textarea
                  rows={3}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Enter academic problem, question, or syllabus inquiry to ground against Google Scholar & library texts..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none leading-relaxed"
                />
              </div>

              {/* Error Alert if any */}
              {errorMessage && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-bold">Notice from Academic Library Archive:</p>
                    <p className="text-amber-800">{errorMessage}</p>
                    <button
                      onClick={() => handleSearch()}
                      className="mt-1 text-xs font-bold text-amber-900 underline hover:text-amber-700 cursor-pointer"
                    >
                      Retry Query Now
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Grounded in Google Scholar, Nelkon & Parker, Abbott, and UNEB Library Archives</span>
                </div>

                <button
                  onClick={() => handleSearch()}
                  disabled={loading || !searchQuery.trim()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer self-end sm:self-auto"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Retrieving from Libraries...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Search Library Archive</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* High-Yield Library Prompts */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Sample Canonical Library Queries
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_SCHOLAR_TOPICS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item.query);
                      setSelectedSubject(item.subject);
                      handleSearch(item.query, 'solutions');
                    }}
                    className="p-2.5 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 transition-all text-xs space-y-0.5"
                  >
                    <span className="font-bold text-slate-900 block truncate">{item.label}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{item.query}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Display */}
          {result && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Library className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        Verified Library Scholarly Analysis
                      </h4>
                      {result.source === 'gemini-google-search' ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                          Live Grounded
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-md">
                          Secondary Library Archive
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Grounded against Google Scholar citations and Ugandan school departmental schemes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleSaveOffline}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{savedOffline ? 'Saved Offline' : 'Save Offline'}</span>
                  </button>
                </div>
              </div>

              {/* Scholarly Body */}
              <div className="prose prose-slate prose-sm max-w-none text-xs leading-relaxed">
                <Markdown>{result.content}</Markdown>
              </div>

              {/* Scholar Citations */}
              {result.groundingChunks && result.groundingChunks.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Google Scholar & Library Citations:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.groundingChunks.map((chunk, idx) => {
                      if (!chunk.web?.uri) return null;
                      return (
                        <a
                          key={idx}
                          href={chunk.web.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 border border-slate-200 text-blue-700 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-blue-500" />
                          <span className="truncate max-w-[200px]">{chunk.web.title || chunk.web.uri}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CROSS-SCHOOL LIBRARY BRIEF TESTS */}
      {activeSubTab === 'brief-tests' && (
        <div className="space-y-4">
          {/* School Archive Selector */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Published Tests from Top Secondary Schools on Google</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Select a brief test retrieved from Ugandan high schools library archives to test your knowledge.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {CROSS_SCHOOL_BRIEF_TESTS.map((test) => (
                <button
                  key={test.id}
                  onClick={() => resetTest(test)}
                  className={`p-3 rounded-2xl border text-left transition-all space-y-1 ${
                    selectedTest.id === test.id
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-bold text-[10px]">
                      {test.schoolName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        test.sector === 'Science'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {test.subject}
                    </span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 truncate">{test.title}</h5>
                  <p className="text-[10px] text-slate-500 truncate">{test.librarySource}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Test Taker Container */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            {/* Test Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-lg text-xs font-bold">
                    {selectedTest.schoolName}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {selectedTest.subject} • {selectedTest.classLevel}
                  </span>
                </div>
                <h3 className="font-black text-base text-slate-900 mt-1">{selectedTest.title}</h3>
                <p className="text-xs text-slate-500">{selectedTest.librarySource}</p>
              </div>

              {submittedTest && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <Award className="w-7 h-7 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-emerald-900">Your Score</span>
                    <div className="text-base font-black text-emerald-800">
                      {calculateScore().score} / {calculateScore().total} ({calculateScore().percentage}%)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {selectedTest.questions.map((q, qIndex) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCorrect = userAnswers[q.id] === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">
                        <span className="mr-1 text-blue-600">Q{qIndex + 1}.</span> {q.question}
                      </h4>
                      {submittedTest && (
                        <span>
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAnswers[q.id] === optIdx;
                        let optionStyle =
                          'border-slate-200 bg-white text-slate-700 hover:border-slate-300';

                        if (submittedTest) {
                          if (optIdx === q.correctIndex) {
                            optionStyle =
                              'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-400';
                          } else if (isSelected && !isCorrect) {
                            optionStyle =
                              'border-rose-400 bg-rose-50 text-rose-800 font-semibold';
                          }
                        } else if (isSelected) {
                          optionStyle =
                            'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/30';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {submittedTest && optIdx === q.correctIndex && (
                              <span className="text-[10px] uppercase font-bold text-emerald-700 ml-2">
                                Correct Answer
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation and Library Marking Scheme Guide */}
                    {submittedTest && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                        <p className="font-medium">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                        <p className="text-[11px] text-blue-700 font-mono">
                          <strong>Library Citation:</strong> {q.libraryMarkSchemeReference}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                {Object.keys(userAnswers).length} of {selectedTest.questions.length} Questions Answered
              </span>

              {submittedTest ? (
                <button
                  type="button"
                  onClick={() => resetTest(selectedTest)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Retake Brief Test
                </button>
              ) : (
                <button
                  type="button"
                  disabled={Object.keys(userAnswers).length === 0}
                  onClick={() => setSubmittedTest(true)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                >
                  Submit & Check with Library Scheme
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
