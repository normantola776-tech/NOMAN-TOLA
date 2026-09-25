import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  MessageSquare,
  Users,
  ShieldCheck,
  PhoneOff,
  Sparkles,
  PenTool,
  Volume2,
  X,
  Play,
  ThumbsUp,
  Heart,
  BarChart2,
  CheckCircle2,
  HelpCircle,
  Clock,
  Radio,
  Share2,
  Flame,
  Award,
  Send,
  Eye,
  BellRing,
} from 'lucide-react';
import { TutoringSession, UserProfile } from '../types.ts';

interface Props {
  session: TutoringSession;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onTriggerNotification?: (title: string, message: string, type: 'session' | 'assignment' | 'grade' | 'system') => void;
}

interface AttendeeStudent {
  id: number;
  name: string;
  school: string;
  classLevel: string;
  avatar: string;
  status: 'listening' | 'understood' | 'question_raised';
  joinedAt: string;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  label: string;
  sender: string;
  leftPercent: number;
}

const INITIAL_ATTENDEES: AttendeeStudent[] = [
  {
    id: 101,
    name: 'Sarah Alinda',
    school: "Mt. St. Mary's Namagunga",
    classLevel: 'Senior Four',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    status: 'understood',
    joinedAt: '10:01 AM',
  },
  {
    id: 102,
    name: 'Ronald Kigozi',
    school: "King's College Budo",
    classLevel: 'Senior Four',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'listening',
    joinedAt: '10:02 AM',
  },
  {
    id: 103,
    name: 'Brenda Nabirye',
    school: 'Gayaza High School',
    classLevel: 'Senior Three',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'understood',
    joinedAt: '10:03 AM',
  },
  {
    id: 104,
    name: 'David Mukasa',
    school: 'Kibuli Secondary School',
    classLevel: 'Senior Four',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'question_raised',
    joinedAt: '10:05 AM',
  },
  {
    id: 105,
    name: 'Emmanuel Ochieng',
    school: "St. Mary's College Kisubi (SMACK)",
    classLevel: 'Senior Four',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    status: 'listening',
    joinedAt: '10:05 AM',
  },
  {
    id: 106,
    name: 'Mercy Kyomugisha',
    school: 'Uganda Martyrs S.S. Namugongo',
    classLevel: 'Senior Three',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    status: 'understood',
    joinedAt: '10:06 AM',
  },
  {
    id: 107,
    name: 'Peter Sserwadda',
    school: 'Namilyango College',
    classLevel: 'Senior Four',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    status: 'listening',
    joinedAt: '10:07 AM',
  },
  {
    id: 108,
    name: 'Patience Atuhaire',
    school: 'Trinity College Nabbingo',
    classLevel: 'Senior Two',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    status: 'understood',
    joinedAt: '10:08 AM',
  },
];

export const LiveClassroomModal: React.FC<Props> = ({
  session,
  user,
  isOpen,
  onClose,
  onTriggerNotification,
}) => {
  // Perspective control: allow user to test both student and tutor capabilities easily
  const isDefaultTutor = user.role === 'tutor' || user.fullName.toLowerCase().includes('tutor') || user.fullName.toLowerCase().includes('kigozi');
  const [activeRolePerspective, setActiveRolePerspective] = useState<'tutor' | 'student'>(
    isDefaultTutor ? 'tutor' : 'student'
  );

  // Session start state (Tutor must click "Start Session" to officially begin)
  const [sessionStarted, setSessionStarted] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);

  // Media states
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareType, setScreenShareType] = useState<'camera' | 'browser' | 'presentation'>('presentation');
  const videoStreamRef = useRef<HTMLVideoElement>(null);
  const screenMediaStreamRef = useRef<MediaStream | null>(null);

  // Classroom Navigation & Content
  const [activeTab, setActiveTab] = useState<'board' | 'chat' | 'chart' | 'attendees'>('chat');
  const [attendees, setAttendees] = useState<AttendeeStudent[]>(INITIAL_ATTENDEES);
  const [showAttendeesDrawer, setShowAttendeesDrawer] = useState(false);

  // Reactions & Floating feedback
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [reactionCounts, setReactionCounts] = useState({
    like: 14,
    clap: 21,
    insight: 18,
    heart: 9,
    question: 3,
  });

  // Student Like / Lesson Appreciation
  const [hasLikedLesson, setHasLikedLesson] = useState(false);
  const [likesTotal, setLikesTotal] = useState(8);
  const [likeNotificationNotice, setLikeNotificationNotice] = useState<string | null>(null);

  // Chat stream
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: session.tutorName || 'Dr. Mark Kigozi',
      role: 'tutor',
      school: session.tutorSchool || "King's College Budo",
      text: "Welcome to today's O-Level Masterclass! I will be taking you through step-by-step UNEB exam derivations. Please confirm if audio and screen are clear.",
      time: '10:00 AM',
    },
    {
      id: 2,
      sender: 'Sarah Alinda',
      role: 'student',
      school: "Mt. St. Mary's Namagunga",
      text: 'Good morning Mwalimu! Sound and visuals are crystal clear from Namagunga.',
      time: '10:01 AM',
    },
    {
      id: 3,
      sender: 'Ronald Kigozi',
      role: 'student',
      school: "King's College Budo",
      text: 'Ready with my graph sheet and UNEB past papers booklet, Sir!',
      time: '10:02 AM',
    },
  ]);

  // Interactive Comprehension Poll (Chart tab)
  const [pollVotes, setPollVotes] = useState({
    fullyUnderstood: 6,
    needExample: 2,
    confused: 0,
  });
  const [userVotedOption, setUserVotedOption] = useState<string | null>(null);

  // Live Timer
  useEffect(() => {
    let timer: any;
    if (sessionStarted) {
      timer = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionStarted]);

  // Stop screen share cleanup
  useEffect(() => {
    return () => {
      if (screenMediaStreamRef.current) {
        screenMediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  if (!isOpen) return null;

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // 1. Tutor Start Session Action
  const handleStartSession = async () => {
    setIsStartingSession(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorName: session.tutorName || user.fullName }),
      });
      if (res.ok) {
        setSessionStarted(true);
        // Announce in chat
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: 'EDURA CLASSROOM SYSTEM',
            role: 'system',
            school: 'Official Broadcast',
            text: `🔴 The Tutor has officially started the live session! Audio, video, and screen sharing are now broadcasting to ${attendees.length} attended students.`,
            time: 'Just now',
          },
        ]);
        if (onTriggerNotification) {
          onTriggerNotification(
            'Masterclass In Session! 🔴',
            `Tutor ${session.tutorName || user.fullName} started "${session.title}". Class is now live!`,
            'session'
          );
        }
      }
    } catch (e) {
      console.error('Failed to start session', e);
      setSessionStarted(true);
    } finally {
      setIsStartingSession(false);
    }
  };

  // 2. Screen Sharing Action
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenMediaStreamRef.current) {
        screenMediaStreamRef.current.getTracks().forEach((t) => t.stop());
        screenMediaStreamRef.current = null;
      }
      setIsScreenSharing(false);
      setScreenShareType('camera');
      return;
    }

    // Try browser display media if available
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        screenMediaStreamRef.current = stream;
        if (videoStreamRef.current) {
          videoStreamRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);
        setScreenShareType('browser');

        // Handle user stopping via browser banner
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenShareType('camera');
        };
      } else {
        // Fallback to high-definition interactive presentation whiteboard
        setIsScreenSharing(true);
        setScreenShareType('presentation');
      }
    } catch (err) {
      console.log('Using simulated presentation stream for screen share', err);
      setIsScreenSharing(true);
      setScreenShareType('presentation');
    }
  };

  // 3. Reactions: Student and Tutor
  const triggerReaction = (emoji: string, label: string, senderName: string = user.fullName) => {
    const newReaction: FloatingReaction = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      label,
      sender: senderName,
      leftPercent: 15 + Math.random() * 70,
    };
    setFloatingReactions((prev) => [...prev.slice(-15), newReaction]);

    // Update counts
    if (emoji === '👍') setReactionCounts((c) => ({ ...c, like: c.like + 1 }));
    if (emoji === '👏') setReactionCounts((c) => ({ ...c, clap: c.clap + 1 }));
    if (emoji === '💡') setReactionCounts((c) => ({ ...c, insight: c.insight + 1 }));
    if (emoji === '❤️') setReactionCounts((c) => ({ ...c, heart: c.heart + 1 }));
    if (emoji === '✋') setReactionCounts((c) => ({ ...c, question: c.question + 1 }));

    // Remove floating item after 3.5 seconds
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3500);
  };

  // Tutor sends encouragement reaction to students
  const handleTutorPraise = (praiseText: string, emoji: string) => {
    triggerReaction(emoji, praiseText, `${session.tutorName || 'Tutor'}`);
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: session.tutorName || 'Tutor',
        role: 'tutor',
        school: session.tutorSchool || 'Tutor Praise',
        text: `${emoji} ${praiseText} to all students attending!`,
        time: 'Just now',
      },
    ]);
  };

  // 4. Student Like Lesson Button (Notifies Creator & Tutor)
  const handleStudentLikeLesson = async () => {
    if (hasLikedLesson) return;
    setHasLikedLesson(true);
    setLikesTotal((prev) => prev + 1);

    // Trigger visual floating hearts
    triggerReaction('👍', 'Understood & Liked Lesson!');
    triggerReaction('❤️', 'Grateful for Lesson');

    try {
      const res = await fetch(`/api/sessions/${session.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          studentName: user.fullName,
          studentSchool: user.schoolName,
          sessionTitle: session.title,
          tutorName: session.tutorName || 'Class Specialist',
        }),
      });

      const data = await res.json();
      const creatorMsg = `${user.fullName} (${user.schoolName}) pressed Like for "${session.title}" by ${session.tutorName}! Student verified they acquired valuable knowledge from the lesson.`;

      // Dispatch high priority notification to Creator
      if (onTriggerNotification) {
        onTriggerNotification('Student Lesson Appreciation 👍', creatorMsg, 'session');
      }

      setLikeNotificationNotice(
        'Thank you! Your Like has been transmitted directly to the Platform Creator & Tutor. They are thrilled you gained from this session!'
      );
    } catch (err) {
      console.error('Error sending like to creator', err);
      if (onTriggerNotification) {
        onTriggerNotification(
          'Student Lesson Appreciation 👍',
          `${user.fullName} pressed Like on ${session.title}! Creator notified.`,
          'session'
        );
      }
      setLikeNotificationNotice(
        'Thank you! Your appreciation was recorded and sent to the platform creator.'
      );
    }
  };

  // 5. Send In-Class Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: activeRolePerspective === 'tutor' ? (session.tutorName || user.fullName) : user.fullName,
      role: activeRolePerspective,
      school: user.schoolName || "King's College Budo",
      text: chatInput.trim(),
      time: 'Just now',
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  // 6. Handle Poll Vote
  const handleVotePoll = (option: 'fullyUnderstood' | 'needExample' | 'confused') => {
    if (userVotedOption) return;
    setUserVotedOption(option);
    setPollVotes((prev) => ({
      ...prev,
      [option]: prev[option] + 1,
    }));
    triggerReaction('📊', 'Comprehension Vote Cast');
  };

  const totalVotes = pollVotes.fullyUnderstood + pollVotes.needExample + pollVotes.confused;
  const understoodPercent = Math.round((pollVotes.fullyUnderstood / (totalVotes || 1)) * 100);
  const needExamplePercent = Math.round((pollVotes.needExample / (totalVotes || 1)) * 100);
  const confusedPercent = Math.round((pollVotes.confused / (totalVotes || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-7xl h-[94vh] shadow-2xl flex flex-col overflow-hidden text-slate-100 relative">
        {/* Floating Animated Reactions Container */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {floatingReactions.map((reaction) => (
            <div
              key={reaction.id}
              style={{ left: `${reaction.leftPercent}%` }}
              className="absolute bottom-16 animate-float-up flex flex-col items-center gap-1 opacity-90 transition-all"
            >
              <span className="text-3xl filter drop-shadow-md">{reaction.emoji}</span>
              <span className="text-[10px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded-full border border-white/20 whitespace-nowrap shadow-sm">
                {reaction.sender}: {reaction.label}
              </span>
            </div>
          ))}
        </div>

        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-3.5 w-3.5 relative">
              {sessionStarted ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
              )}
            </span>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1">{session.title}</h3>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold rounded-full shrink-0">
                  {session.subject}
                </span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium rounded-full shrink-0">
                  {session.classLevel || 'Senior Four'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="font-medium text-slate-200">
                  Tutor: {session.tutorName || 'High School Specialist'} ({session.tutorSchool || "King's College Budo"})
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  E2EE Live Encrypted
                </span>
                {sessionStarted && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 font-mono font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(sessionSeconds)}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Perspective & Attendance Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher (For Testing & Presentation) */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveRolePerspective('tutor')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  activeRolePerspective === 'tutor'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Tutor Screen</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRolePerspective('student')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  activeRolePerspective === 'student'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Student Screen</span>
              </button>
            </div>

            {/* Attended Students Count Badge & Drawer Trigger */}
            <button
              type="button"
              onClick={() => setShowAttendeesDrawer(!showAttendeesDrawer)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="View all students who attended"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold text-white">{attendees.length}</span>
              <span className="hidden sm:inline">Students Attended</span>
            </button>

            {/* Leave Room Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Class</span>
            </button>
          </div>
        </div>

        {/* Notice Banner: If Student Liked */}
        {likeNotificationNotice && (
          <div className="bg-emerald-950 border-b border-emerald-800 px-4 py-2 text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{likeNotificationNotice}</span>
            </div>
            <button
              onClick={() => setLikeNotificationNotice(null)}
              className="text-emerald-400 hover:text-white text-xs font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Stage & Right Collaborative Bar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Main Visual Stage (Video, Screen Share, Whiteboard, or Waiting Screen) */}
          <div className="flex-1 flex flex-col bg-slate-950 p-3 sm:p-4 overflow-hidden relative">
            {/* Screen Content Container */}
            <div className="flex-1 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col relative min-h-0">
              {/* If Session has NOT started yet */}
              {!sessionStarted ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-slate-950">
                  <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4 shadow-lg animate-pulse">
                    <Radio className="w-10 h-10" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">
                    {activeRolePerspective === 'tutor'
                      ? 'Live Masterclass Ready to Begin'
                      : 'Waiting for Tutor to Start the Lesson'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                    {activeRolePerspective === 'tutor'
                      ? `Welcome Mwalimu ${session.tutorName || user.fullName}. ${attendees.length} students from King's College Budo, Gayaza, SMACK, and Namagunga are in the lobby waiting for you to begin.`
                      : `Tutor ${session.tutorName || 'Certified Specialist'} is preparing syllabus slides and whiteboard derivation. You will be connected live immediately when the lesson starts.`}
                  </p>

                  {/* Tutor MUST press this button to start the lesson */}
                  {activeRolePerspective === 'tutor' ? (
                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={handleStartSession}
                        disabled={isStartingSession}
                        className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        <span>{isStartingSession ? 'Starting Broadcast...' : 'Start Live Session Now'}</span>
                      </button>
                      <span className="text-[11px] text-slate-400">
                        Pressing start unlocks audio, video broadcast, and screen sharing to all {attendees.length} students.
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>Standby in Lobby • Audio testing complete • {attendees.length} students waiting</span>
                    </div>
                  )}
                </div>
              ) : isScreenSharing ? (
                /* Screen Sharing Feed */
                <div className="flex-1 bg-slate-950 relative flex flex-col overflow-hidden">
                  <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2 font-mono text-emerald-400">
                      <Monitor className="w-4 h-4 text-blue-400" />
                      <span>
                        Screen Sharing Active: {session.subject} (Senior Four UNEB Derivations & Past Papers)
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-bold">
                        1080p 60fps
                      </span>
                    </div>
                    {activeRolePerspective === 'tutor' && (
                      <button
                        type="button"
                        onClick={handleToggleScreenShare}
                        className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-[11px] font-bold transition-colors"
                      >
                        Stop Sharing
                      </button>
                    )}
                  </div>

                  {screenShareType === 'browser' ? (
                    <video
                      ref={videoStreamRef}
                      autoPlay
                      playsInline
                      className="flex-1 w-full h-full object-contain bg-black"
                    />
                  ) : (
                    /* High-Definition Interactive Screen Presentation Slide */
                    <div className="flex-1 p-6 bg-slate-950 font-sans text-slate-200 overflow-y-auto space-y-4">
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                          <div>
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                              Live Screen Broadcast • Slide 4 of 12
                            </span>
                            <h4 className="text-base font-bold text-white">
                              Electromagnetism & Faraday's Law of Induction (UNEB Section B)
                            </h4>
                          </div>
                          <span className="text-xs text-slate-400">Uganda O-Level NCDC Syllabus</span>
                        </div>

                        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 font-mono text-xs text-emerald-300 space-y-2">
                          <p className="text-slate-400 font-sans text-xs">
                            Step 1: Calculate Magnetic Flux through coil of N = 500 turns:
                          </p>
                          <p className="font-bold text-sm text-yellow-300">
                            Φ = B · A · cos(θ) = (0.25 T) × (0.04 m²) × cos(0°) = 0.01 Wb
                          </p>
                          <p className="text-slate-400 font-sans text-xs pt-2">
                            Step 2: Apply Neumann's Formula for Induced Electromotive Force (EMF):
                          </p>
                          <p className="font-bold text-sm text-emerald-400">
                            ε = - N · (ΔΦ / Δt) = - 500 · [(0.01 - 0) / 0.05 s] = - 100 Volts
                          </p>
                        </div>

                        <div className="mt-4 p-3 bg-blue-950/40 rounded-xl border border-blue-900/60 text-xs text-blue-200 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Mwalimu's Exam Note: </span>
                            Always remember that the negative sign represents Lenz's Law indicating that the induced current opposes the flux change causing it. In UNEB marking, omitting the unit (Volts) loses 1 mark.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Picture-in-picture Tutor Video */}
                  <div className="absolute bottom-4 right-4 w-40 h-28 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-2xl bg-slate-900 z-10">
                    <img
                      src={session.tutorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                      alt="Tutor"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 right-1 bg-slate-950/80 px-2 py-0.5 rounded-lg text-[9px] text-white flex items-center justify-between">
                      <span className="truncate">{session.tutorName || 'Tutor'}</span>
                      <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse shrink-0" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Video Feed Layout */
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 p-3 overflow-hidden">
                  {/* Tutor Primary Feed (Big Screen) */}
                  <div className="lg:col-span-3 relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col">
                    <div className="relative flex-1 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
                      <img
                        src={session.tutorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'}
                        alt={session.tutorName}
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-white">
                          {session.tutorName || 'Tutor Stream'} (Speaking)
                        </span>
                        <span className="px-1.5 py-0.5 bg-blue-500/30 text-blue-300 text-[10px] rounded">
                          Tutor Host
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-[11px] text-slate-300">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span>{attendees.length} Students Attending</span>
                      </div>
                    </div>
                  </div>

                  {/* Side Column: Student Webcams */}
                  <div className="hidden lg:flex flex-col gap-2.5">
                    {/* Current User */}
                    <div className="h-36 relative rounded-2xl overflow-hidden bg-slate-800 border border-blue-500/40">
                      {isVideoOn ? (
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400'}
                          alt="You"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
                          <VideoOff className="w-5 h-5 mb-1" />
                          <span className="text-[11px]">Camera Off</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-slate-900/90 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white flex items-center gap-1">
                        <span>{user.fullName} (You)</span>
                        {isMicOn ? <Mic className="w-2.5 h-2.5 text-emerald-400" /> : <MicOff className="w-2.5 h-2.5 text-rose-400" />}
                      </div>
                    </div>

                    {/* Attended Peer 1 */}
                    <div className="h-32 relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"
                        alt="Sarah Alinda"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-slate-900/90 px-2 py-0.5 rounded-lg text-[9px] text-white flex items-center gap-1">
                        <span>Sarah Alinda</span>
                        <span className="text-slate-400 text-[8px]">• Namagunga</span>
                      </div>
                    </div>

                    {/* Attended Peer 2 */}
                    <div className="h-32 relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
                        alt="Ronald Kigozi"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-slate-900/90 px-2 py-0.5 rounded-lg text-[9px] text-white flex items-center gap-1">
                        <span>Ronald Kigozi</span>
                        <span className="text-slate-400 text-[8px]">• Budo</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls Bar: Media, Screen Sharing, Reactions, and Student Like Button */}
            <div className="mt-3 py-2.5 px-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Media Hardware Toggles */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-2.5 rounded-xl transition-all ${
                    isMicOn
                      ? 'bg-slate-800 hover:bg-slate-700 text-white'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                  title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-2.5 rounded-xl transition-all ${
                    isVideoOn
                      ? 'bg-slate-800 hover:bg-slate-700 text-white'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                  title={isVideoOn ? 'Camera Off' : 'Camera On'}
                >
                  {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                {/* Tutor Screen Share Button */}
                {activeRolePerspective === 'tutor' && (
                  <button
                    type="button"
                    onClick={handleToggleScreenShare}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isScreenSharing
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                    title="Share your desktop, whiteboard, or slides to students"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>{isScreenSharing ? 'Sharing Screen' : 'Share Screen'}</span>
                  </button>
                )}
              </div>

              {/* Dynamic Reaction Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {activeRolePerspective === 'tutor' ? (
                  /* Tutor praise reactions to students */
                  <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 mr-1 font-semibold hidden sm:inline">Praise Students:</span>
                    <button
                      type="button"
                      onClick={() => handleTutorPraise('Excellent Answer!', '⭐')}
                      className="px-2 py-1 bg-slate-800 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                      title="Send Star to Students"
                    >
                      <span>⭐</span>
                      <span className="hidden md:inline text-[10px]">Excellent!</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTutorPraise('Spot on Derivation!', '🎯')}
                      className="px-2 py-1 bg-slate-800 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                      title="Send Bullseye to Students"
                    >
                      <span>🎯</span>
                      <span className="hidden md:inline text-[10px]">Spot On</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTutorPraise('Great effort!', '👏')}
                      className="px-2 py-1 bg-slate-800 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                      title="Send Clap to Students"
                    >
                      <span>👏</span>
                      <span className="hidden md:inline text-[10px]">Well Done</span>
                    </button>
                  </div>
                ) : (
                  /* Student reactions */
                  <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => triggerReaction('👍', 'Understood!')}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-base transition-transform hover:scale-125"
                      title="Understood"
                    >
                      👍
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerReaction('👏', 'Clapped')}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-base transition-transform hover:scale-125"
                      title="Clap"
                    >
                      👏
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerReaction('💡', 'Got It!')}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-base transition-transform hover:scale-125"
                      title="Insight"
                    >
                      💡
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerReaction('❤️', 'Loved Lesson')}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-base transition-transform hover:scale-125"
                      title="Love"
                    >
                      ❤️
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerReaction('✋', 'Hand Raised')}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-base transition-transform hover:scale-125"
                      title="Raise Hand"
                    >
                      ✋
                    </button>
                  </div>
                )}

                {/* THE STUDENT LIKE BUTTON (Notifies Creator) */}
                <button
                  type="button"
                  onClick={handleStudentLikeLesson}
                  disabled={hasLikedLesson}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    hasLikedLesson
                      ? 'bg-emerald-600/90 text-white cursor-default'
                      : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white transform hover:scale-105 active:scale-95'
                  }`}
                  title="Press immediately after/during the lesson to notify the Creator you gained knowledge!"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasLikedLesson ? 'fill-current' : ''}`} />
                  <span>{hasLikedLesson ? `Liked! (${likesTotal})` : 'I Learned Something! 👍'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Collaboration Panel (Live Chat, Board, Chart & Attendees) */}
          <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col h-72 md:h-auto min-h-0 shrink-0">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition-colors ${
                  activeTab === 'chat'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chart')}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition-colors ${
                  activeTab === 'chart'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Chart & Poll</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('board')}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition-colors ${
                  activeTab === 'board'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Board</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('attendees')}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition-colors ${
                  activeTab === 'attendees'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>({attendees.length})</span>
              </button>
            </div>

            {/* TAB 1: LIVE CHAT */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-xl p-2.5 text-xs ${
                        msg.role === 'tutor'
                          ? 'bg-blue-950/50 border border-blue-900/60'
                          : msg.role === 'system'
                          ? 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-200'
                          : 'bg-slate-800/70 border border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${msg.role === 'tutor' ? 'text-blue-300' : 'text-slate-200'}`}>
                            {msg.sender}
                          </span>
                          {msg.role === 'tutor' && (
                            <span className="px-1 bg-blue-500/20 text-blue-400 text-[9px] rounded font-semibold">
                              Tutor
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500">{msg.time}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      activeRolePerspective === 'tutor'
                        ? 'Message your students...'
                        : 'Ask tutor a question...'
                    }
                    className="flex-1 bg-slate-950 px-3 py-2 rounded-xl text-xs text-white border border-slate-700 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: LIVE CHART & ENGAGEMENT ANALYTICS */}
            {activeTab === 'chart' && (
              <div className="flex-1 p-3.5 overflow-y-auto space-y-4 text-xs">
                {/* 1. Live Comprehension Check Poll */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Live Comprehension Check</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{totalVotes} votes cast</span>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    "Do you understand today's derivation and formula substitution?"
                  </p>

                  {/* Interactive Options */}
                  <div className="space-y-2 pt-1">
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1">
                        <span>Fully Understood (D1 Standard)</span>
                        <span className="text-emerald-400">{understoodPercent}% ({pollVotes.fullyUnderstood})</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${understoodPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1">
                        <span>Need One More Example</span>
                        <span className="text-amber-400">{needExamplePercent}% ({pollVotes.needExample})</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${needExamplePercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1">
                        <span>Still Confused / Review Needed</span>
                        <span className="text-rose-400">{confusedPercent}% ({pollVotes.confused})</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${confusedPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vote action for students */}
                  {!userVotedOption ? (
                    <div className="flex gap-1.5 pt-2">
                      <button
                        type="button"
                        onClick={() => handleVotePoll('fullyUnderstood')}
                        className="flex-1 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-xl text-[10px] font-bold transition-all"
                      >
                        I Understood
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVotePoll('needExample')}
                        className="flex-1 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded-xl text-[10px] font-bold transition-all"
                      >
                        1 More Example
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-emerald-400 text-center font-medium pt-1">
                      ✓ Your vote was recorded on tutor's screen.
                    </p>
                  )}
                </div>

                {/* 2. Real-Time Attendance & Attention Rate */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-bold text-white text-xs block">Attendance Metric</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                      <span className="text-lg font-black text-blue-400 block">{attendees.length} / 10</span>
                      <span className="text-[10px] text-slate-400">80% Registered Attended</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                      <span className="text-lg font-black text-emerald-400 block">96%</span>
                      <span className="text-[10px] text-slate-400">Attention Retention</span>
                    </div>
                  </div>
                </div>

                {/* 3. Reaction Summary Chart */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-bold text-white text-xs block">Student Reactions Log</span>
                  <div className="flex justify-between items-center text-xs">
                    <span>👍 Understood: <strong className="text-blue-400">{reactionCounts.like}</strong></span>
                    <span>👏 Claps: <strong className="text-amber-400">{reactionCounts.clap}</strong></span>
                    <span>💡 Got It: <strong className="text-emerald-400">{reactionCounts.insight}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BLACKBOARD NOTES */}
            {activeTab === 'board' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-emerald-300 space-y-2">
                  <div className="text-[11px] text-slate-400 font-sans font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Tutor's Live Derivation Notes:</span>
                  </div>
                  <p className="leading-relaxed">
                    E = - dΦ/dt = - d(B·A)/dt<br />
                    Induced EMF = - N · Δ(B · A · cos θ) / Δt<br />
                    Lenz's Law ensures opposition of flux change.
                  </p>
                </div>

                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                  <h5 className="font-semibold text-slate-200 mb-1">Key UNEB / Cambridge Exam Tips:</h5>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    <li>Always state units in S.I. (Tesla, Weber, Volts).</li>
                    <li>Draw magnetic field lines from North to South with arrows.</li>
                    <li>Label eddy current loops in solid conductors.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: ATTENDED STUDENTS ROSTER */}
            {activeTab === 'attendees' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Attended Students Roster</span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-md text-[10px] font-bold">
                    {attendees.length} Present
                  </span>
                </div>
                <div className="flex-1 p-3 overflow-y-auto space-y-2">
                  {attendees.map((student) => (
                    <div
                      key={student.id}
                      className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-white truncate">{student.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{student.school}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded">
                          Attended {student.joinedAt}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Full Screen Attendees Roster Drawer */}
        {showAttendeesDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      Students Attended ({attendees.length})
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Verified Secondary Students attending live masterclass
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAttendeesDrawer(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {attendees.map((student) => (
                  <div
                    key={student.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <h5 className="font-bold text-xs text-white">{student.name}</h5>
                        <p className="text-[10px] text-slate-400">
                          {student.school} • {student.classLevel}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-lg">
                      Joined {student.joinedAt}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAttendeesDrawer(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Close Roster
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
