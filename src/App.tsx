/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { MobileFrame } from './components/MobileFrame.tsx';
import { TutorCatalog } from './components/TutorCatalog.tsx';
import { SpecialSessionsList } from './components/SpecialSessionsList.tsx';
import { StudyMaterialsView } from './components/StudyMaterialsView.tsx';
import { MessagingPortal } from './components/MessagingPortal.tsx';
import { AssignmentsDashboard } from './components/AssignmentsDashboard.tsx';
import { AiStudyAssistantView } from './components/AiStudyAssistantView.tsx';
import { SchoolIdVerificationModal } from './components/SchoolIdVerificationModal.tsx';
import { PaymentModal } from './components/PaymentModal.tsx';
import { LiveClassroomModal } from './components/LiveClassroomModal.tsx';
import { CreatorFinanceSuite } from './components/CreatorFinanceSuite.tsx';
import { CreatorContactModal } from './components/CreatorContactModal.tsx';
import { NotificationCenterModal } from './components/NotificationCenterModal.tsx';
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
    gradeLevel: 'Senior 4 (Grade 10 - O Level)',
    schoolName: "King's College Budo",
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
    idCardVerified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    bio: 'Lead Physics and Pure Mathematics instructor with 12 years of distinction coaching.',
  },
  creator: {
    id: 3,
    uid: 'creator-admin-3',
    email: 'director@edurahigh.org',
    fullName: 'Edura Platform Directorate',
    role: 'creator',
    gradeLevel: 'Administrative Board',
    schoolName: 'Centenary Payout Operations',
    idCardVerified: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    bio: 'Platform financial management & tax compliance officer.',
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
  const [deviceFrame, setDeviceFrame] = useState<'ios' | 'android' | 'web'>('ios');

  // Push notifications state
  const [notifications, setNotifications] = useState<PushNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeBanner, setActiveBanner] = useState<PushNotification | null>(INITIAL_NOTIFICATIONS[0]);

  // Modals state
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreatorContactOpen, setIsCreatorContactOpen] = useState(false);
  const [isCreatorFinanceOpen, setIsCreatorFinanceOpen] = useState(false);

  // Payment & Live Classroom session state
  const [payingSession, setPayingSession] = useState<TutoringSession | null>(null);
  const [liveClassroomSession, setLiveClassroomSession] = useState<TutoringSession | null>(null);
  const [paidSessionIds, setPaidSessionIds] = useState<number[]>([1]); // session 1 is unlocked for instant testing

  // Messaging selected contact
  const [chatTargetTutor, setChatTargetTutor] = useState<Tutor | null>(null);

  const handleRoleSwitch = (role: 'student' | 'tutor' | 'creator') => {
    setCurrentUser(PROFILES[role]);
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
      handleTriggerPushNotification(
        'Session Unlocked! 🎟️',
        `Payment approved via ${bookingResult.booking?.paymentMethod || 'Gateway'}. Room pass active!`,
        'session'
      );
      setLiveClassroomSession(payingSession);
      setPayingSession(null);
    }
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-800">
      {/* Platform Header */}
      <Header
        user={currentUser}
        activeView={activeTab}
        setActiveView={setActiveTab}
        deviceFrame={deviceFrame}
        setDeviceFrame={setDeviceFrame}
        onOpenVerification={() => setIsVerificationOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenCreatorContact={() => setIsCreatorContactOpen(true)}
        onOpenCreatorFinance={() => setIsCreatorFinanceOpen(true)}
        unreadNotificationsCount={unreadNotifCount}
        onSwitchUserRole={handleRoleSwitch}
      />

      {/* Cross-Platform Frame Layout (iOS / Android / Web) */}
      <MobileFrame
        deviceFrame={deviceFrame}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeBannerNotification={activeBanner}
        onDismissBanner={() => setActiveBanner(null)}
        unreadMessagesCount={2}
      >
        {activeTab === 'tutors' && (
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
        )}

        {activeTab === 'sessions' && (
          <SpecialSessionsList
            user={currentUser}
            paidSessionIds={paidSessionIds}
            onPaySession={(session) => setPayingSession(session)}
            onEnterClassroom={(session) => setLiveClassroomSession(session)}
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
    </div>
  );
}

