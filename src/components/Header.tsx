import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Bell,
  Smartphone,
  Tablet,
  Laptop,
  Building2,
  LifeBuoy,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { UserProfile } from '../types.ts';

interface Props {
  user: UserProfile;
  activeView: string;
  setActiveView: (view: string) => void;
  deviceFrame: 'ios' | 'android' | 'web';
  setDeviceFrame: (frame: 'ios' | 'android' | 'web') => void;
  onOpenVerification: () => void;
  onOpenNotifications: () => void;
  onOpenCreatorContact: () => void;
  onOpenCreatorFinance: () => void;
  unreadNotificationsCount: number;
  onSwitchUserRole: (role: 'student' | 'tutor' | 'creator') => void;
}

export const Header: React.FC<Props> = ({
  user,
  activeView,
  setActiveView,
  deviceFrame,
  setDeviceFrame,
  onOpenVerification,
  onOpenNotifications,
  onOpenCreatorContact,
  onOpenCreatorFinance,
  unreadNotificationsCount,
  onSwitchUserRole,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-950 text-base tracking-tight">
                Edura High
              </span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                Uganda Secondary
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Cross-Platform High School Tutoring & Study Hub
            </p>
          </div>
        </div>

        {/* Device Frame Switcher (iOS / Android / Web) */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setDeviceFrame('ios')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              deviceFrame === 'ios'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iOS Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceFrame('android')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              deviceFrame === 'android'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceFrame('web')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              deviceFrame === 'web'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Responsive Web</span>
          </button>
        </div>

        {/* Right Controls: Role, ID Verification, Notifications, Support */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* School ID Verification Pill */}
          <button
            type="button"
            onClick={onOpenVerification}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              user.idCardVerified
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
            title="Student School ID Card Status"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">
              {user.idCardVerified ? 'School ID Verified' : 'Verify School ID'}
            </span>
          </button>

          {/* Push Notification Bell */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Class & Homework Push Reminders"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Emergency Creator Support Desk */}
          <button
            type="button"
            onClick={onOpenCreatorContact}
            className="p-2 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Emergency Creator Support Desk"
          >
            <LifeBuoy className="w-5 h-5 text-rose-500" />
          </button>

          {/* Creator Financial Portal (Confidential) */}
          <button
            type="button"
            onClick={onOpenCreatorFinance}
            className="p-2 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            title="Creator Financial & Tax Management"
          >
            <Building2 className="w-5 h-5 text-blue-700" />
          </button>

          {/* Quick Role Switcher */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs">
            <button
              onClick={() => onSwitchUserRole('student')}
              className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                user.role === 'student' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => onSwitchUserRole('tutor')}
              className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                user.role === 'tutor' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Tutor
            </button>
            <button
              onClick={() => onSwitchUserRole('creator')}
              className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                user.role === 'creator' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Creator
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
