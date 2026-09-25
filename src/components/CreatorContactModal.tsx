import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  X,
} from 'lucide-react';
import { UserProfile, SystemTicket } from '../types.ts';

interface Props {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorContactModal: React.FC<Props> = ({ user, isOpen, onClose }) => {
  const [category, setCategory] = useState('system_error');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'medium'>('urgent');
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SystemTicket[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTickets();
    }
  }, [isOpen]);

  const loadTickets = async () => {
    try {
      const res = await fetch('/api/tickets/all');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Non-JSON response');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        setTickets([]);
      }
    } catch (e) {
      console.error('Failed to load tickets', e);
      setTickets((prev) => (Array.isArray(prev) ? prev : []));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.fullName,
          userRole: user.role,
          category,
          subject,
          description,
          priority,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch ticket');

      setSuccessMessage('Your urgent dispatch has been received by the creator directorate.');
      setSubject('');
      setDescription('');
      loadTickets();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 border border-rose-400/30 rounded-2xl">
              <LifeBuoy className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Direct Creator Support & Error Desk</h3>
              <p className="text-xs text-slate-300">Urgent Escalation & Emergency Dispatch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'new'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dispatch New Urgent Message
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Resolution Status ({tickets.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {activeTab === 'new' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="system_error">System Error / Bug</option>
                    <option value="urgent_question">Urgent Academic Question</option>
                    <option value="payment_dispute">Payment / Gateway Dispute</option>
                    <option value="session_access">Live Video / Audio Access</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="urgent">🔴 Urgent (Immediate Response)</option>
                    <option value="high">🟠 High (Within 1 Hour)</option>
                    <option value="medium">🟡 Standard Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Video room froze during Cambridge Mechanics session"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Detailed Explanation</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide precise details, steps to reproduce, or urgent question..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Dispatching to Creator...' : 'Send Urgent Dispatch to Creator'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {!Array.isArray(tickets) || tickets.length === 0 ? (
                <p className="text-center py-8 text-slate-400">No reported issues logged.</p>
              ) : (
                (Array.isArray(tickets) ? tickets : []).map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{t.subject}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-600">{t.description}</p>
                    {t.creatorNotes && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg text-blue-900 font-medium">
                        <strong>Creator Direct Note:</strong> {t.creatorNotes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
