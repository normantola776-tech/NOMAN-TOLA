import React from 'react';
import {
  Users,
  Video,
  FileText,
  MessageSquare,
  BarChart2,
  Wifi,
  Battery,
  Signal,
  Bell,
  X,
  Sparkles,
} from 'lucide-react';
import { PushNotification } from '../types.ts';

interface Props {
  deviceFrame: 'ios' | 'android' | 'web';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  activeBannerNotification: PushNotification | null;
  onDismissBanner: () => void;
  unreadMessagesCount: number;
}

export const MobileFrame: React.FC<Props> = ({
  deviceFrame,
  activeTab,
  setActiveTab,
  children,
  activeBannerNotification,
  onDismissBanner,
  unreadMessagesCount,
}) => {
  const tabs = [
    { id: 'tutors', label: 'Tutors', icon: Users },
    { id: 'sessions', label: 'Classes', icon: Video },
    { id: 'ai-assistant', label: 'AI Notes & Solutions', icon: Sparkles },
    { id: 'materials', label: 'Study Hub', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'progress', label: 'Dashboard', icon: BarChart2 },
  ];

  if (deviceFrame === 'web') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-100/70 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Active Banner Notification */}
          {activeBannerNotification && (
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between animate-in slide-in-from-top-3">
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
                className="p-1 rounded-lg hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Web Tab Nav */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="pb-10">{children}</div>
        </div>
      </div>
    );
  }

  const isIOS = deviceFrame === 'ios';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900/90 py-6 px-2 sm:px-4 flex items-center justify-center">
      {/* Mobile Device Mockup */}
      <div
        className={`relative bg-white shadow-2xl overflow-hidden flex flex-col transition-all ${
          isIOS
            ? 'w-full max-w-[420px] h-[850px] rounded-[52px] border-[10px] border-slate-800 ring-1 ring-slate-700'
            : 'w-full max-w-[430px] h-[860px] rounded-[44px] border-[9px] border-slate-800 ring-1 ring-slate-700'
        }`}
      >
        {/* Device Native Status Bar */}
        <div className="h-11 bg-white px-7 flex items-center justify-between text-xs text-slate-800 font-semibold select-none z-30 shrink-0">
          <span>9:41</span>

          {/* Dynamic Island (iOS) or Punch Hole (Android) */}
          {isIOS ? (
            <div className="w-28 h-6 bg-slate-950 rounded-full flex items-center justify-center gap-2 px-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <span className="w-2 h-2 rounded-full bg-slate-800" />
            </div>
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-slate-950 ring-2 ring-slate-300" />
          )}

          <div className="flex items-center gap-1.5 text-slate-700">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* In-Phone Push Notification Dropdown Banner */}
        {activeBannerNotification && (
          <div className="absolute top-12 left-3 right-3 z-50 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl border border-slate-700 flex items-start justify-between gap-2 animate-in slide-in-from-top-4">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-xl mt-0.5">
                <Bell className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Edura Push Notification
                </span>
                <h5 className="font-bold text-xs text-white">
                  {activeBannerNotification.title}
                </h5>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  {activeBannerNotification.message}
                </p>
              </div>
            </div>
            <button
              onClick={onDismissBanner}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Mobile App Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/70 scrollbar-none">
          {children}
        </div>

        {/* Native Mobile Bottom Tab Bar */}
        <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 pt-2 pb-5 flex items-center justify-around shrink-0 z-30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center gap-1 transition-all ${
                  isActive ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.badge && tab.badge > 0 ? (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Home Indicator Bar (iOS / Android gesture line) */}
        <div className="h-4 bg-white flex items-center justify-center pb-1">
          <div className="w-32 h-1 bg-slate-400 rounded-full" />
        </div>
      </div>
    </div>
  );
};
