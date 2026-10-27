import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Bell,
  Building2,
  LifeBuoy,
  UserPlus,
  Gift,
  Sparkles,
  Download,
  LogOut,
} from 'lucide-react';
import { UserProfile } from '../types.ts';

interface Props {
  user: UserProfile;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenVerification: () => void;
  onOpenNotifications: () => void;
  onOpenCreatorContact: () => void;
  onOpenCreatorFinance: () => void;
  onOpenRegistration?: () => void;
  onOpenDownloadApp?: () => void;
  unreadNotificationsCount: number;
  onSwitchUserRole: (role: 'student' | 'tutor' | 'creator') => void;
  onLogout?: () => void;
}

export const Header: React.FC<Props> = ({
  user,
  activeView,
  setActiveView,
  onOpenVerification,
  onOpenNotifications,
  onOpenCreatorContact,
  onOpenCreatorFinance,
  onOpenRegistration,
  onOpenDownloadApp,
  unreadNotificationsCount,
  onSwitchUserRole,
  onLogout,
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
              {user.sector && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider hidden md:inline-block ${
                  user.sector === 'Science'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : user.sector === 'Art'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  {user.sector} Sector
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-[280px]">
              {user.fullName} • {user.schoolName || "King's College Budo"} • {user.gradeLevel || 'Senior 4'}
            </p>
          </div>
        </div>

        {/* First Time Bonus Badge for Student */}
        {user.role === 'student' && (user.bonusSessionsCount ?? 0) > 0 && (
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold animate-pulse">
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            <span>1 Free Bonus Session Credited!</span>
          </div>
        )}

        {/* Right Controls: Register Account, Download App, Role, ID Verification, Notifications, Support */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Download App Button */}
          {onOpenDownloadApp && (
            <button
              type="button"
              onClick={onOpenDownloadApp}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs transition-all cursor-pointer ring-1 ring-emerald-500/20"
              title="Download Android APK (.apk) or Install App"
            >
              <Download className="w-3.5 h-3.5 text-emerald-100" />
              <span className="hidden sm:inline">Download APK</span>
              <span className="inline sm:hidden">APK</span>
            </button>
          )}

          {/* Create/Register Account Button */}
          {onOpenRegistration && (
            <button
              type="button"
              onClick={onOpenRegistration}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
              title="Create Student or Tutor Account"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Register Account</span>
            </button>
          )}

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
            title="Class Reminders & normantola776@gmail.com Email Dispatches"
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

          {/* Log Out to Role Login Screen Button */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
              title="Log out and return to unified role login screen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Log Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
