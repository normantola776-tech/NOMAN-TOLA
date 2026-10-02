import React from 'react';
import {
  Users,
  Video,
  FileText,
  MessageSquare,
  BarChart2,
  Bell,
  X,
  BookOpen,
  Calendar,
  Building2,
  GraduationCap,
  Sparkles,
  Download,
  Smartphone,
} from 'lucide-react';
import { PushNotification, UserProfile } from '../types.ts';

interface Props {
  user?: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  activeBannerNotification: PushNotification | null;
  onDismissBanner: () => void;
  unreadMessagesCount: number;
  onOpenDownloadApp?: () => void;
}

export const MobileFrame: React.FC<Props> = ({
  user,
  activeTab,
  setActiveTab,
  children,
  activeBannerNotification,
  onDismissBanner,
  unreadMessagesCount,
  onOpenDownloadApp,
}) => {
  const isTutor = user?.role === 'tutor';
  const isCreator = user?.role === 'creator';

  const tabs = isCreator
    ? [
        { id: 'activities', label: 'All App Activities & Audit', icon: Building2 },
        { id: 'classroom', label: 'Google Classroom', icon: GraduationCap },
        { id: 'sessions', label: 'Live Classes', icon: Video },
        { id: 'tutors', label: 'Tutors & Lessons', icon: Calendar },
        { id: 'ai-assistant', label: 'Scholar Library', icon: BookOpen },
        { id: 'materials', label: 'Study Hub', icon: FileText },
        { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
        { id: 'progress', label: 'Academic Progress', icon: BarChart2 },
      ]
    : [
        {
          id: 'tutors',
          label: isTutor ? 'My Lessons & Timetable' : 'Tutors',
          icon: isTutor ? Calendar : Users,
        },
        { id: 'classroom', label: 'Google Classroom', icon: GraduationCap },
        { id: 'sessions', label: 'Classes', icon: Video },
        { id: 'ai-assistant', label: 'Scholar Library & Tests', icon: BookOpen },
        { id: 'materials', label: 'Study Hub', icon: FileText },
        { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
        { id: 'progress', label: 'Dashboard', icon: BarChart2 },
      ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100/70">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
        {/* Active Notification Banner */}
        {activeBannerNotification && (
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between animate-in slide-in-from-top-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bell className="w-5 h-5 text-amber-300 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-xs">{activeBannerNotification.title}</h4>
                <p className="text-xs text-blue-100">{activeBannerNotification.message}</p>
              </div>
            </div>
            <button
              onClick={onDismissBanner}
              className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick App Download & Install Strip for Mobile / Cross-Platform */}
        {onOpenDownloadApp && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-3 text-white shadow-xs flex items-center justify-between gap-3 sm:hidden">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Smartphone className="w-4 h-4 text-emerald-100" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Install Edura High on your Device</p>
                <p className="text-[10px] text-emerald-100">Android & Apple iOS Play Store/App Store Ready</p>
              </div>
            </div>
            <button
              onClick={onOpenDownloadApp}
              className="px-3 py-1.5 bg-white text-emerald-800 rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-50 transition-all cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          </div>
        )}

        {/* Responsive Desktop & Tablet Top Navigation Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] py-2.5 px-3 sm:px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Main Application Content - Fully Responsive for all screen sizes */}
        <main className="w-full pb-16 sm:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (Phone Screens) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 flex items-center justify-around shadow-lg">
        {tabs.slice(0, 5).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-0.5 max-w-[64px] truncate">
                {tab.id === 'ai-assistant' ? 'Library' : tab.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
