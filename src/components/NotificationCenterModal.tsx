import React from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  Sparkles,
  Volume2,
  X,
  Trash2,
} from 'lucide-react';
import { PushNotification } from '../types.ts';

interface Props {
  notifications: PushNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSendTestReminder: () => void;
}

export const NotificationCenterModal: React.FC<Props> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
  onClearAll,
  onSendTestReminder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Push Notifications Center</h3>
              <p className="text-xs text-blue-100">Class Reminders & Homework Alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={onSendTestReminder}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Simulate Push Reminder</span>
          </button>

          <div className="flex gap-2 text-slate-500">
            <button
              onClick={onMarkAllRead}
              className="hover:text-slate-800 font-medium"
            >
              Mark Read
            </button>
            <span>•</span>
            <button
              onClick={onClearAll}
              className="hover:text-rose-600 font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No new notifications.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1 ${
                  n.read
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-blue-50/70 border-blue-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    {n.type === 'session' && <Calendar className="w-3.5 h-3.5 text-blue-600" />}
                    {n.type === 'assignment' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                    {n.type === 'grade' && <Award className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{n.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {n.timestamp}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">{n.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Push notifications enabled for iOS & Android devices.
        </div>
      </div>
    </div>
  );
};
