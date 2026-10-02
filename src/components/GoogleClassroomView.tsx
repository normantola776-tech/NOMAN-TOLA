import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Users,
  Plus,
  ExternalLink,
  RefreshCw,
  LogOut,
  AlertCircle,
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  Send,
  HelpCircle,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logoutGoogle,
} from '../lib/googleAuth.ts';
import {
  ClassroomCourse,
  ClassroomCourseWork,
  ClassroomAnnouncement,
  ClassroomUserProfile,
  listCourses,
  listCourseWork,
  listAnnouncements,
  listTeachers,
  listStudents,
  createCourse,
  createCourseWork,
  createAnnouncement,
} from '../lib/googleClassroomApi.ts';
import { UserProfile } from '../types.ts';

interface Props {
  user: UserProfile;
}

export const GoogleClassroomView: React.FC<Props> = ({ user: appUser }) => {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Classroom Data
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ClassroomCourse | null>(null);
  const [courseWork, setCourseWork] = useState<ClassroomCourseWork[]>([]);
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [teachers, setTeachers] = useState<ClassroomUserProfile[]>([]);
  const [students, setStudents] = useState<ClassroomUserProfile[]>([]);
  const [activeCourseTab, setActiveCourseTab] = useState<'coursework' | 'announcements' | 'roster'>('coursework');
  const [loadingData, setLoadingData] = useState(false);

  // Modals for creation
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseSection, setNewCourseSection] = useState('Senior 4 • Term 2');
  const [newCourseSubject, setNewCourseSubject] = useState('Science');

  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentDesc, setNewAssignmentDesc] = useState('');
  const [newAssignmentPoints, setNewAssignmentPoints] = useState(100);

  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');

  // Confirmation modal state (MANDATORY per skill guidelines)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setGoogleUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(!accessToken);
        if (accessToken) {
          loadCourses(accessToken);
        }
      },
      () => {
        setGoogleUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      setGoogleUser(res.user);
      setToken(res.accessToken);
      setNeedsAuth(false);
      await loadCourses(res.accessToken);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setAuthError(err.message || 'Google authentication was cancelled or failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setToken(null);
    setNeedsAuth(true);
    setCourses([]);
    setSelectedCourse(null);
  };

  const loadCourses = async (accessToken: string) => {
    setLoadingData(true);
    try {
      const courseList = await listCourses(accessToken);
      setCourses(courseList);
      if (courseList.length > 0) {
        handleSelectCourse(courseList[0], accessToken);
      }
    } catch (err: any) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSelectCourse = async (course: ClassroomCourse, activeAccessToken?: string) => {
    setSelectedCourse(course);
    const tokenToUse = activeAccessToken || token || getAccessToken();
    if (!tokenToUse) return;

    setLoadingData(true);
    try {
      const [work, ann, t, s] = await Promise.all([
        listCourseWork(tokenToUse, course.id).catch(() => []),
        listAnnouncements(tokenToUse, course.id).catch(() => []),
        listTeachers(tokenToUse, course.id).catch(() => []),
        listStudents(tokenToUse, course.id).catch(() => []),
      ]);
      setCourseWork(work);
      setAnnouncements(ann);
      setTeachers(t);
      setStudents(s);
    } catch (err) {
      console.error('Error loading course details:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Required confirmation handlers for mutating Google Classroom actions
  const triggerCreateCourse = () => {
    if (!newCourseName.trim()) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Course Creation in Google Classroom',
      message: `Are you sure you want to create the class "${newCourseName}" (${newCourseSection}) on your Google Classroom account? This will appear in classroom.google.com for your students.`,
      onConfirm: async () => {
        const activeToken = token || getAccessToken();
        if (!activeToken) return;
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          const created = await createCourse(activeToken, {
            name: newCourseName,
            section: newCourseSection,
            descriptionHeading: `Edura High Platform • ${newCourseSubject}`,
            description: `Official secondary course synced with Edura High digital tutoring hub.`,
          });
          setIsCreateCourseOpen(false);
          setNewCourseName('');
          await loadCourses(activeToken);
          setSelectedCourse(created);
        } catch (err: any) {
          alert(`Error creating course: ${err.message}`);
        }
      },
    });
  };

  const triggerCreateAssignment = () => {
    if (!selectedCourse || !newAssignmentTitle.trim()) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Assignment Publication',
      message: `Publish "${newAssignmentTitle}" (${newAssignmentPoints} points) to Google Classroom course "${selectedCourse.name}"? Enrolled students will receive notifications in their Google Classroom.`,
      onConfirm: async () => {
        const activeToken = token || getAccessToken();
        if (!activeToken || !selectedCourse) return;
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await createCourseWork(activeToken, selectedCourse.id, {
            title: newAssignmentTitle,
            description: newAssignmentDesc || 'Complete the attached problem set and submit step-by-step working.',
            maxPoints: newAssignmentPoints,
          });
          setIsCreateAssignmentOpen(false);
          setNewAssignmentTitle('');
          setNewAssignmentDesc('');
          handleSelectCourse(selectedCourse);
        } catch (err: any) {
          alert(`Error publishing assignment: ${err.message}`);
        }
      },
    });
  };

  const triggerCreateAnnouncement = () => {
    if (!selectedCourse || !newAnnouncementText.trim()) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Announcement Broadcast',
      message: `Post this announcement to all students enrolled in "${selectedCourse.name}" on Google Classroom?`,
      onConfirm: async () => {
        const activeToken = token || getAccessToken();
        if (!activeToken || !selectedCourse) return;
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await createAnnouncement(activeToken, selectedCourse.id, newAnnouncementText);
          setIsCreateAnnouncementOpen(false);
          setNewAnnouncementText('');
          handleSelectCourse(selectedCourse);
        } catch (err: any) {
          alert(`Error broadcasting announcement: ${err.message}`);
        }
      },
    });
  };

  // Quick Seed Class for students/teachers with empty Classroom accounts
  const handleQuickCreateSampleCourse = () => {
    setNewCourseName("Senior 4 Pure Mathematics • King's College Budo");
    setNewCourseSection('2026 Academic Year • UNEB Prep');
    setNewCourseSubject('Mathematics');
    setIsCreateCourseOpen(true);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-emerald-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-bold">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                <span>Google Workspace Classroom API Verified</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-200 border border-blue-400/30 rounded-xl text-xs font-semibold">
                <span>Direct Sync with classroom.google.com</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Google Classroom Sync & Coursework Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Connect your school Google Account to synchronize Google Classroom classes, access assignments, 
              post class announcements, review rosters, and link digital tutoring sessions.
            </p>
          </div>

          {/* Google Sign-in / Connected Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {googleUser ? (
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 p-2 sm:p-2.5 rounded-2xl">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google User'}
                    className="w-9 h-9 rounded-xl object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    {googleUser.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div className="text-left text-xs">
                  <div className="font-bold text-white leading-tight">
                    {googleUser.displayName || 'Google Account'}
                  </div>
                  <div className="text-[11px] text-slate-300 truncate max-w-[170px]">
                    {googleUser.email}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Disconnect Google Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Auth Screen if not signed in */}
      {needsAuth ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Connect Your Google Classroom
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Sign in with your Google account to access your enrolled secondary school classes, 
              view pending assignments, post announcements, and sync your grades.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Official Google Material Sign-in Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-2xl shadow-sm text-slate-700 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              <span>{isLoggingIn ? 'Connecting to Google Classroom...' : 'Sign in with Google Classroom'}</span>
            </button>
          </div>

          <div className="pt-4 text-[11px] text-slate-400">
            Permission requested for courses, coursework, rosters and announcements.
          </div>
        </div>
      ) : (
        /* Connected Google Classroom Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Courses List & Creator Action */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Your Classes</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Active Google Classroom courses ({courses.length})
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateCourseOpen(true)}
                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Create Class in Google Classroom"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {loadingData && courses.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                  <span>Loading Google Classroom courses...</span>
                </div>
              ) : courses.length === 0 ? (
                <div className="p-5 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-3">
                  <p className="text-xs text-slate-600">
                    No active Google Classroom classes found on this Google account.
                  </p>
                  <button
                    onClick={handleQuickCreateSampleCourse}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    Create S.4 Ugandan Class
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all space-y-1 cursor-pointer ${
                        selectedCourse?.id === course.id
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 block truncate">
                          {course.name}
                        </span>
                        {course.alternateLink && (
                          <a
                            href={course.alternateLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-slate-400 hover:text-emerald-700"
                            title="Open in Google Classroom"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        {course.section && <span>{course.section}</span>}
                        {course.enrollmentCode && (
                          <>
                            <span>•</span>
                            <span className="font-mono">Code: {course.enrollmentCode}</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Course Workspace */}
          <div className="lg:col-span-8 space-y-4">
            {selectedCourse ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                {/* Course Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        {selectedCourse.name}
                      </h2>
                      {selectedCourse.alternateLink && (
                        <a
                          href={selectedCourse.alternateLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 border border-slate-200 text-emerald-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-emerald-600" />
                          <span>Google Classroom Link</span>
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedCourse.section || 'General Secondary Section'} • {teachers.length} Teachers • {students.length} Students
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCreateAssignmentOpen(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Assignment</span>
                    </button>
                    <button
                      onClick={() => setIsCreateAnnouncementOpen(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Post Notice</span>
                    </button>
                  </div>
                </div>

                {/* Course Section Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-fit text-xs font-bold">
                  <button
                    onClick={() => setActiveCourseTab('coursework')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                      activeCourseTab === 'coursework'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Assignments ({courseWork.length})
                  </button>
                  <button
                    onClick={() => setActiveCourseTab('announcements')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                      activeCourseTab === 'announcements'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Announcements ({announcements.length})
                  </button>
                  <button
                    onClick={() => setActiveCourseTab('roster')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                      activeCourseTab === 'roster'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Roster ({teachers.length + students.length})
                  </button>
                </div>

                {/* TAB 1: COURSEWORK & ASSIGNMENTS */}
                {activeCourseTab === 'coursework' && (
                  <div className="space-y-3">
                    {courseWork.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2">
                        <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                        <h4 className="font-bold text-xs text-slate-800">No Coursework Published Yet</h4>
                        <p className="text-[11px] text-slate-500">
                          Create an assignment in Google Classroom to publish questions and homework to students.
                        </p>
                        <button
                          onClick={() => setIsCreateAssignmentOpen(true)}
                          className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Create First Assignment
                        </button>
                      </div>
                    ) : (
                      courseWork.map((work) => (
                        <div
                          key={work.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-slate-900">{work.title}</h4>
                              {work.maxPoints && (
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                                  {work.maxPoints} pts
                                </span>
                              )}
                            </div>
                            {work.description && (
                              <p className="text-xs text-slate-600 line-clamp-2 max-w-xl">
                                {work.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                              {work.dueDate && (
                                <span className="flex items-center gap-1 text-amber-700 font-medium">
                                  <Clock className="w-3 h-3" />
                                  <span>Due: {work.dueDate.day}/{work.dueDate.month}/{work.dueDate.year}</span>
                                </span>
                              )}
                              <span>Status: {work.state || 'PUBLISHED'}</span>
                            </div>
                          </div>

                          {work.alternateLink && (
                            <a
                              href={work.alternateLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                              <span>View Work</span>
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 2: ANNOUNCEMENTS */}
                {activeCourseTab === 'announcements' && (
                  <div className="space-y-3">
                    {announcements.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs text-slate-500">
                        No announcements posted to this class yet.
                      </div>
                    ) : (
                      announcements.map((ann) => (
                        <div key={ann.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                          <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {ann.text}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                            <span>Posted {ann.creationTime ? new Date(ann.creationTime).toLocaleDateString() : 'recently'}</span>
                            {ann.alternateLink && (
                              <a
                                href={ann.alternateLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-700 hover:underline flex items-center gap-1"
                              >
                                <span>Google Classroom</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 3: ROSTER */}
                {activeCourseTab === 'roster' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                        Instructors & Teachers ({teachers.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {teachers.map((t) => (
                          <div key={t.id} className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                            {t.photoUrl ? (
                              <img src={t.photoUrl} alt={t.name.fullName} className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                                {t.name.givenName?.charAt(0) || 'T'}
                              </div>
                            )}
                            <div className="text-xs">
                              <span className="font-bold text-slate-900 block">{t.name.fullName}</span>
                              <span className="text-[11px] text-slate-500">{t.emailAddress}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                        Enrolled Students ({students.length})
                      </h4>
                      {students.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">
                          No students enrolled yet. Share the course code: <strong className="font-mono text-emerald-700">{selectedCourse.enrollmentCode || 'N/A'}</strong>
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {students.map((s) => (
                            <div key={s.id} className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                              {s.photoUrl ? (
                                <img src={s.photoUrl} alt={s.name.fullName} className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                                  {s.name.givenName?.charAt(0) || 'S'}
                                </div>
                              )}
                              <div className="text-xs">
                                <span className="font-bold text-slate-900 block">{s.name.fullName}</span>
                                <span className="text-[11px] text-slate-500">{s.emailAddress}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                Select a class from the list to view coursework and announcements.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE COURSE MODAL */}
      {isCreateCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Create Class in Google Classroom</h3>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Title</label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g. Senior 4 Physics • Gayaza High School"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Section / Cohort</label>
                <input
                  type="text"
                  value={newCourseSection}
                  onChange={(e) => setNewCourseSection(e.target.value)}
                  placeholder="e.g. Term 2 • 2026 Examination Cohort"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Track</label>
                <select
                  value={newCourseSubject}
                  onChange={(e) => setNewCourseSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Science">Science (Physics, Math, Chem, Bio)</option>
                  <option value="Art">Art (Literature, History, Economics)</option>
                  <option value="Both">General Secondary</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateCourseOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={triggerCreateCourse}
                disabled={!newCourseName.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                Create Google Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {isCreateAssignmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Publish Assignment to Google Classroom</h3>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assignment Title</label>
                <input
                  type="text"
                  value={newAssignmentTitle}
                  onChange={(e) => setNewAssignmentTitle(e.target.value)}
                  placeholder="e.g. Electromagnetic Induction Problem Set 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Instructions / Description</label>
                <textarea
                  rows={3}
                  value={newAssignmentDesc}
                  onChange={(e) => setNewAssignmentDesc(e.target.value)}
                  placeholder="Instructions for students on solving and submitting step-by-step working..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Maximum Points</label>
                <input
                  type="number"
                  value={newAssignmentPoints}
                  onChange={(e) => setNewAssignmentPoints(parseInt(e.target.value, 10) || 100)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateAssignmentOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={triggerCreateAssignment}
                disabled={!newAssignmentTitle.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                Publish to Google Classroom
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ANNOUNCEMENT MODAL */}
      {isCreateAnnouncementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Broadcast Class Notice</h3>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Notice Message</label>
                <textarea
                  rows={4}
                  value={newAnnouncementText}
                  onChange={(e) => setNewAnnouncementText(e.target.value)}
                  placeholder="Enter notice for students (e.g. Masterclass starting at 2:00 PM, bring formula sheet)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateAnnouncementOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={triggerCreateAnnouncement}
                disabled={!newAnnouncementText.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                Post to Google Classroom
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPLICIT USER CONFIRMATION DIALOG (MANDATORY FOR MUTATING OPERATIONS) */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">{confirmDialog.title}</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer"
              >
                Confirm & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
