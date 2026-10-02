/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { MobileFrame } from './components/MobileFrame.tsx';
import { TutorCatalog } from './components/TutorCatalog.tsx';
import { TutorWorkspaceView } from './components/TutorWorkspaceView.tsx';
import { SpecialSessionsList } from './components/SpecialSessionsList.tsx';
import { StudyMaterialsView } from './components/StudyMaterialsView.tsx';
import { MessagingPortal } from './components/MessagingPortal.tsx';
import { AssignmentsDashboard } from './components/AssignmentsDashboard.tsx';
import { AiStudyAssistantView } from './components/AiStudyAssistantView.tsx';
import { SchoolIdVerificationModal } from './components/SchoolIdVerificationModal.tsx';
import { AccountRegistrationModal } from './components/AccountRegistrationModal.tsx';
import { PaymentModal } from './components/PaymentModal.tsx';
import { LiveClassroomModal } from './components/LiveClassroomModal.tsx';
import { CreatorFinanceSuite } from './components/CreatorFinanceSuite.tsx';
import { CreatorContactModal } from './components/CreatorContactModal.tsx';
import { CreatorActivityPortalView } from './components/CreatorActivityPortalView.tsx';
import { GoogleClassroomView } from './components/GoogleClassroomView.tsx';
import { NotificationCenterModal } from './components/NotificationCenterModal.tsx';
import { DownloadAppModal } from './components/DownloadAppModal.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import {
  UserProfile,
  Tutor,
  TutoringSession,
  PushNotification,
} from './types.ts';

const PROFILES: Record<'student' | 'tutor' | 'creator', UserProfile> = {
  student: {
    id: 2,
    uid: 'student-demo-2',
    email: 'joel.mukasa@budo.ac.ug',
    fullName: 'Joel Mukasa',
    role: 'student',
    gradeLevel: 'Senior 4',
    schoolName: "King's College Budo",
    nationality: 'Ugandan',
    sector: 'Science',
    hasFirstTimeBonus: true,
    bonusSessionsCount: 1, // 1 Free bonus session credited for first-time orders!
    ordersCount: 1,
    idCardVerified: true,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    bio: 'Aspiring engineer preparing for UNEB UCE and Cambridge IGCSE examinations.',
  },
  tutor: {
    id: 1,
    uid: 'tutor-demo-1',
    email: 'kigozi.mark@budo.ac.ug',
    fullName: 'Dr. Mark Kigozi',
    role: 'tutor',
    gradeLevel: 'Senior 4 - Senior 6 (A-Level)',
    schoolName: "King's College Budo",
    nationality: 'Ugandan',
    sector: 'Science',
    idCardVerified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    bio: 'Lead Physics and Pure Mathematics instructor with 12 years of distinction coaching.',
  },
  creator: {
    id: 3,
    uid: 'creator-admin-3',
    email: 'normantola776@gmail.com',
    fullName: 'Edura Platform Directorate',
    role: 'creator',
    gradeLevel: 'Administrative Board',
    schoolName: 'Centenary Payout Operations',
    nationality: 'Ugandan',
    sector: 'Both',
    idCardVerified: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    bio: 'Platform financial management & tax compliance officer. Direct notifications: normantola776@gmail.com',
  },
};

const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'n1',
    type: 'session',
    title: 'Upcoming Masterclass in 45 Mins! ⏰',
    message: 'Physics: Electromagnetic Induction & Alternating Current with Dr. Mark Kigozi starts at 10:00 AM.',
    timestamp: '10m ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'assignment',
    title: 'Homework Deadline Tomorrow 📝',
    message: 'Differential Calculus Worksheet #4 is due tomorrow at 11:59 PM.',
    timestamp: '1h ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'grade',
    title: 'New Grade Published: A+ (95%) 🌟',
    message: 'Sarah Namubiru graded your Organic Reactions Synthesis assignment.',
    timestamp: '3h ago',
    read: true,
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(PROFILES.student);
  const [activeTab, setActiveTab] = useState<string>('tutors');

  // Push notifications state
  const [notifications, setNotifications] = useState<PushNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeBanner, setActiveBanner] = useState<PushNotification | null>(INITIAL_NOTIFICATIONS[0]);

  // Modals state
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [registrationRole, setRegistrationRole] = useState<'student' | 'tutor'>('student');
  const [registrationIntent, setRegistrationIntent] = useState<string>('purchase a session');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreatorContactOpen, setIsCreatorContactOpen] = useState(false);
  const [isCreatorFinanceOpen, setIsCreatorFinanceOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Payment & Live Classroom session state
  const [payingSession, setPayingSession] = useState<TutoringSession | null>(null);
  const [liveClassroomSession, setLiveClassroomSession] = useState<TutoringSession | null>(null);
  const [paidSessionIds, setPaidSessionIds] = useState<number[]>([1]); // session 1 is unlocked for instant testing

  // Messaging selected contact
  const [chatTargetTutor, setChatTargetTutor] = useState<Tutor | null>(null);

  const handleRoleSwitch = (role: 'student' | 'tutor' | 'creator') => {
    setCurrentUser(PROFILES[role]);
    if (role === 'creator') {
      setActiveTab('activities');
    } else if (activeTab === 'activities') {
      setActiveTab('tutors');
    }
  };

  const handleTriggerPushNotification = (
    title: string,
    message: string,
    type: 'session' | 'assignment' | 'grade'
  ) => {
    const newNotif: PushNotification = {
      id: `n-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setActiveBanner(newNotif);
  };

  const handleSendTestClassReminder = () => {
    handleTriggerPushNotification(
      'Live Masterclass Reminder! 🔔',
      'Your booked special session is starting now. Audio and Video room unlocked.',
      'session'
    );
  };

  const handlePaymentSuccess = (bookingResult: any) => {
    if (payingSession) {
      setPaidSessionIds((prev) => Array.from(new Set([...prev, payingSession.id])));

      // First-time student order bonus award
      const isFirstOrder = (currentUser.ordersCount ?? 0) === 0 || bookingResult?.firstOrderBonusGranted;
      if (isFirstOrder && currentUser.role === 'student') {
        setCurrentUser((prev) => ({
          ...prev,
          ordersCount: (prev.ordersCount || 0) + 1,
          bonusSessionsCount: (prev.bonusSessionsCount || 0) + 1,
          hasFirstTimeBonus: true,
        }));
        handleTriggerPushNotification(
          '1 Free Bonus Session Credited! 🎁',
          'First-time student bonus unlocked: You have 1 FREE 1 1/2 hr session voucher ready for your next class!',
          'session'
        );
      } else {
        handleTriggerPushNotification(
          'Session Unlocked! 🎟️',
          `Payment approved via ${bookingResult.booking?.paymentMethod || 'Gateway'}. Room pass active!`,
          'session'
        );
      }

      setLiveClassroomSession(payingSession);
      setPayingSession(null);
    }
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans text-slate-800">
      {/* Platform Header */}
      <Header
        user={currentUser}
        activeView={activeTab}
        setActiveView={setActiveTab}
        onOpenVerification={() => setIsVerificationOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenCreatorContact={() => setIsCreatorContactOpen(true)}
        onOpenCreatorFinance={() => setIsCreatorFinanceOpen(true)}
        onOpenRegistration={() => {
          setRegistrationRole('student');
          setRegistrationIntent('register on Edura High');
          setIsRegistrationOpen(true);
        }}
        onOpenDownloadApp={() => setIsDownloadModalOpen(true)}
        unreadNotificationsCount={unreadNotifCount}
        onSwitchUserRole={handleRoleSwitch}
      />

      {/* Responsive Application Layout for All Devices */}
      <MobileFrame
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeBannerNotification={activeBanner}
        onDismissBanner={() => setActiveBanner(null)}
        unreadMessagesCount={2}
        onOpenDownloadApp={() => setIsDownloadModalOpen(true)}
      >
        {activeTab === 'activities' && (
          <CreatorActivityPortalView
            user={currentUser}
            onOpenCreatorContact={() => setIsCreatorContactOpen(true)}
            onOpenCreatorFinance={() => setIsCreatorFinanceOpen(true)}
          />
        )}

        {activeTab === 'classroom' && (
          <GoogleClassroomView user={currentUser} />
        )}

        {activeTab === 'tutors' && (
          currentUser.role === 'tutor' ? (
            <TutorWorkspaceView
              user={currentUser}
              onEnterClassroom={(session) => setLiveClassroomSession(session)}
              onTriggerNotification={handleTriggerPushNotification}
            />
          ) : (
            <TutorCatalog
              user={currentUser}
              onSelectTutorToChat={(tutor) => {
                setChatTargetTutor(tutor);
                setActiveTab('messages');
              }}
              onBookSession={(tutor) => {
                setActiveTab('sessions');
              }}
            />
          )
        )}

        {activeTab === 'sessions' && (
          <SpecialSessionsList
            user={currentUser}
            paidSessionIds={paidSessionIds}
            onPaySession={(session) => {
              // If student is not registered or has generic demo, allow them to verify/register
              setPayingSession(session);
            }}
            onEnterClassroom={(session) => setLiveClassroomSession(session)}
            onRequestRegister={() => {
              setRegistrationRole('student');
              setRegistrationIntent('purchase a session');
              setIsRegistrationOpen(true);
            }}
          />
        )}

        {activeTab === 'ai-assistant' && <AiStudyAssistantView user={currentUser} />}

        {activeTab === 'materials' && (
          <StudyMaterialsView
            user={currentUser}
            onOpenAiAssistant={() => setActiveTab('ai-assistant')}
          />
        )}

        {activeTab === 'messages' && (
          <MessagingPortal user={currentUser} initialTutor={chatTargetTutor} />
        )}

        {activeTab === 'progress' && (
          <AssignmentsDashboard
            user={currentUser}
            onTriggerNotification={handleTriggerPushNotification}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
      </MobileFrame>

      {/* Modals */}
      <AccountRegistrationModal
        isOpen={isRegistrationOpen}
        defaultRole={registrationRole}
        intentAction={registrationIntent}
        onClose={() => setIsRegistrationOpen(false)}
        onRegisterSuccess={(newUser) => {
          setCurrentUser(newUser);
          handleTriggerPushNotification(
            'Account Registered! 🎓',
            `Welcome ${newUser.fullName} (${newUser.schoolName}). Your ${newUser.role} profile is now active!`,
            'session'
          );
        }}
      />

      {/* Modals */}
      <SchoolIdVerificationModal
        user={currentUser}
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        onVerified={(updated) => {
          setCurrentUser(updated);
          handleTriggerPushNotification(
            'School Identity Verified ✓',
            `${updated.schoolName} credentials verified with high school privacy standard.`,
            'session'
          );
        }}
      />

      {payingSession && (
        <PaymentModal
          session={payingSession}
          user={currentUser}
          isOpen={true}
          onClose={() => setPayingSession(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {liveClassroomSession && (
        <LiveClassroomModal
          session={liveClassroomSession}
          user={currentUser}
          isOpen={true}
          onClose={() => setLiveClassroomSession(null)}
          onTriggerNotification={handleTriggerPushNotification}
        />
      )}

      <CreatorFinanceSuite
        user={currentUser}
        isOpen={isCreatorFinanceOpen}
        onClose={() => setIsCreatorFinanceOpen(false)}
      />

      <CreatorContactModal
        user={currentUser}
        isOpen={isCreatorContactOpen}
        onClose={() => setIsCreatorContactOpen(false)}
      />

      <NotificationCenterModal
        notifications={notifications}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onClearAll={() => setNotifications([])}
        onSendTestReminder={handleSendTestClassReminder}
      />

      {/* Offline Connectivity Notification */}
      <OfflineIndicator />

      {/* PWA & Cross-Platform Store Download Modal */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}

