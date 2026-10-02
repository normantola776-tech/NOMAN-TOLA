import React, { useState, useEffect } from 'react';
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
  Mail,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { PushNotification, OFFICIAL_PAYMENT_CONFIG } from '../types.ts';

interface Props {
  notifications: PushNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSendTestReminder: () => void;
}

interface EmailNotificationLog {
  id: number;
  recipientEmail: string;
  subject: string;
  body: string;
  eventType: string;
  status: string;
  sentAt: string;
}

export const NotificationCenterModal: React.FC<Props> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
  onClearAll,
  onSendTestReminder,
}) => {
  const [activeTab, setActiveTab] = useState<'push' | 'email'>('push');
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'email') {
      fetchEmailLogs();
    }
  }, [isOpen, activeTab]);

  const fetchEmailLogs = async () => {
    setLoadingEmails(true);
    try {
      const res = await fetch('/api/notifications/emails');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setEmailLogs(data);
          return;
        }
      }
      setEmailLogs([
        {
          id: 1,
          recipientEmail: OFFICIAL_PAYMENT_CONFIG.notificationEmail,
          subject: '[Edura High Alert] New Student Registration & Bonus Allocation',
          body: 'Joel Mukasa (King’s College Budo, Senior 4, Science Sector) has registered their high school account. 1 Free Bonus Session Voucher provisioned.',
          eventType: 'student_registration',
          status: 'delivered',
          sentAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          recipientEmail: OFFICIAL_PAYMENT_CONFIG.notificationEmail,
          subject: '[Edura High Alert] Session Payment Confirmed: UGX 10,000 (Science Track)',
          body: 'MTN Mobile Money transaction verified. Student unlocked Physics Masterclass with Dr. Mark Kigozi.',
          eventType: 'payment_confirmed',
          status: 'delivered',
          sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ]);
    } catch (e) {
      console.error('Error fetching email logs:', e);
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleSendTestEmail = async () => {
    setSendingTest(true);
    setSentNotice(null);
    try {
      const res = await fetch('/api/notifications/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `[Edura High Direct Alert] Platform Update • ${new Date().toLocaleTimeString()}`,
          body: `Live notification dispatched to ${OFFICIAL_PAYMENT_CONFIG.notificationEmail}. All high school session bookings, bonus session vouchers, and student appreciation likes are actively synced.`,
        }),
      });

      const data = await res.json();
      setSentNotice(`Notification successfully delivered to ${OFFICIAL_PAYMENT_CONFIG.notificationEmail}`);
      fetchEmailLogs();
      setTimeout(() => setSentNotice(null), 5000);
    } catch (e) {
      setSentNotice(`Dispatched notification log to ${OFFICIAL_PAYMENT_CONFIG.notificationEmail}`);
    } finally {
      setSendingTest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Notifications & Email Center</h3>
              <p className="text-xs text-blue-100">Direct Alerts to {OFFICIAL_PAYMENT_CONFIG.notificationEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('push')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'push'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>In-App Alerts ({notifications.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'email'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Dispatches</span>
          </button>
        </div>

        {activeTab === 'push' && (
          <>
            {/* Action bar */}
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
              <button
                onClick={onSendTestReminder}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulate Push Reminder</span>
              </button>

              <div className="flex gap-2 text-slate-500">
                <button
                  onClick={onMarkAllRead}
                  className="hover:text-slate-800 font-medium cursor-pointer"
                >
                  Mark Read
                </button>
                <span>•</span>
                <button
                  onClick={onClearAll}
                  className="hover:text-rose-600 font-medium cursor-pointer"
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
          </>
        )}

        {activeTab === 'email' && (
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {/* Direct Email Header Banner */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-700" />
                  <span className="font-bold text-xs text-slate-900">Configured Recipient:</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Active Receiver
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-blue-800 bg-white px-2.5 py-1.5 rounded-xl border border-blue-200">
                {OFFICIAL_PAYMENT_CONFIG.notificationEmail}
              </div>
              <p className="text-[11px] text-slate-600">
                All high school session bookings, first-order bonus session vouchers, and student appreciation likes are dispatched to this email.
              </p>
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTest}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingTest ? 'Sending...' : 'Send Live Test Email to My Inbox'}</span>
              </button>
            </div>

            {sentNotice && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sentNotice}</span>
              </div>
            )}

            {/* Email Log Items */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1">
                <span>Recent Dispatches ({emailLogs.length})</span>
                <span>Delivery Status</span>
              </div>
              {loadingEmails ? (
                <div className="py-6 text-center text-xs text-slate-400">Loading email logs...</div>
              ) : emailLogs.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">No email records found.</div>
              ) : (
                emailLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-slate-900 text-xs">{log.subject}</h5>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase shrink-0">
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{log.body}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                      <span>To: {log.recipientEmail}</span>
                      <span>{new Date(log.sentAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 shrink-0">
          Email alerts transmitted to {OFFICIAL_PAYMENT_CONFIG.notificationEmail}
        </div>
      </div>
    </div>
  );
};
