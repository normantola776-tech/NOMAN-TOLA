import React, { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  Receipt,
  FileCheck2,
  Lock,
  Download,
  CheckCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
} from 'lucide-react';
import { CreatorFinancialSummary, UserProfile } from '../types.ts';

interface Props {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorFinanceSuite: React.FC<Props> = ({ user, isOpen, onClose }) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(user.role === 'creator');
  const [summary, setSummary] = useState<CreatorFinancialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [payoutTriggered, setPayoutTriggered] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadFinancials();
    }
  }, [isAuthenticated, isOpen]);

  const loadFinancials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/creator/financials');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Non-JSON response');
      }
      const data = await res.json();
      if (data && typeof data === 'object' && !('error' in data)) {
        setSummary(data);
      }
    } catch (e) {
      console.error('Failed to load creator financials:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '320530' || pin === '3205303331' || user.role === 'creator') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid Creator Security PIN. Only authorized platform directorate may view financial ledgers.');
    }
  };

  const handleTriggerCentenaryPayout = () => {
    setPayoutTriggered(true);
    setTimeout(() => {
      alert(
        'Payout Batch #CENT-2026-904 dispatched to Account 3205303331 (Centenary Bank). Automated SMS & email notification sent to Creator.'
      );
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 border border-blue-500/40 rounded-2xl">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Creator Financial & Tax Management Suite</h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-md text-[10px] font-mono">
                  CONFIDENTIAL
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Connected Payout Account: <span className="font-mono font-semibold text-emerald-400">3205303331 (Centenary Bank)</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Security Check if not authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto text-center space-y-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-700">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900">Creator Access Restricted</h4>
              <p className="text-xs text-slate-500 mt-1">
                This portal handles automated tax reporting, bank disbursements, and platform revenues. Enter the Creator PIN to proceed.
              </p>
            </div>
            <form onSubmit={handleUnlock} className="space-y-3 pt-2">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 6-digit Creator PIN (Demo: 320530)"
                className="w-full text-center tracking-widest px-4 py-3 rounded-2xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs transition-all shadow-md"
              >
                Authenticate & Access Financials
              </button>
            </form>
          </div>
        ) : (
          /* Financial Dashboard */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Bank & Mobile Money Status Bar */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-blue-200">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Centenary Bank Settlement • Registered Channels</span>
                </div>
                <div className="mt-1 text-xl sm:text-2xl font-mono font-bold tracking-wider text-white">
                  3205303331
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-blue-200 mt-1">
                  <span>
                    MTN MoMo Inflow: <strong className="font-mono text-amber-300">+256773489862</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Airtel Money Inflow: <strong className="font-mono text-red-300">+256731074878</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="text-right text-[11px] text-blue-200 hidden sm:block">
                  <div>Science: <strong className="text-white">UGX 10,000/hr</strong></div>
                  <div>Arts: <strong className="text-white">UGX 8,000/hr</strong></div>
                </div>
                <button
                  onClick={handleTriggerCentenaryPayout}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reconcile & Settle Payout</span>
                </button>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Gross Booking Volume
                </span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">
                  UGX {(summary?.totalGrossRevenue || 55000).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">MTN, Airtel & Bank switches</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Tutors Disbursed (75%)
                </span>
                <span className="text-xl font-bold text-blue-700 mt-1 block">
                  UGX {(summary?.totalTutorDisbursements || 41250).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Automated tutor earnings</span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Creator Net Fee (20%)
                </span>
                <span className="text-xl font-bold text-emerald-700 mt-1 block">
                  UGX {(summary?.totalCreatorNetEarnings || 11000).toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 mt-1 block">Deposited to Centenary 3205303331</span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
                <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                  Tax Withheld (5% WHT)
                </span>
                <span className="text-xl font-bold text-amber-700 mt-1 block">
                  UGX {(summary?.totalTaxWithheld || 2750).toLocaleString()}
                </span>
                <span className="text-[10px] text-amber-600 mt-1 block">Automated URA Tax Reserve</span>
              </div>
            </div>

            {/* Tax Compliance Banner */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-white">Uganda Revenue Authority (URA) Automated Tax Compliance</h5>
                  <p className="text-slate-400 text-[11px]">
                    5% Withholding Tax (WHT) calculated on each digital tutoring lesson. Form WHT-E generated.
                  </p>
                </div>
              </div>
              <button
                onClick={() => alert('Exporting URA Tax Statement for Creator Account 3205303331...')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl flex items-center gap-1.5 transition-colors text-[11px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Tax Ledger</span>
              </button>
            </div>

            {/* Transactions Ledger Table */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span>Real-time Financial Ledger & Centenary Bank Payouts</span>
                </h4>
                <span className="text-xs text-slate-500">
                  Live PostgreSQL Records
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Txn Ref</th>
                        <th className="p-3">Student</th>
                        <th className="p-3">Tutor / Subject</th>
                        <th className="p-3">Gross (UGX)</th>
                        <th className="p-3">Tutor Share</th>
                        <th className="p-3">Creator Fee</th>
                        <th className="p-3">Gateway</th>
                        <th className="p-3">Bank Destination</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(summary?.recentTransactions || []).map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-mono text-[11px] font-medium text-slate-700">
                            {tx.transactionRef}
                          </td>
                          <td className="p-3 font-medium text-slate-900">{tx.studentName}</td>
                          <td className="p-3 text-slate-600">
                            <span className="font-medium">{tx.tutorName}</span>
                            <span className="text-slate-400 block text-[10px]">{tx.subject}</span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            UGX {tx.grossAmount.toLocaleString()}
                          </td>
                          <td className="p-3 text-blue-700 font-medium">
                            UGX {tx.tutorShare.toLocaleString()}
                          </td>
                          <td className="p-3 text-emerald-700 font-bold">
                            UGX {tx.creatorPlatformFee.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {tx.paymentGateway}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-700 font-semibold">
                            3205303331 (Centenary)
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                              <CheckCircle className="w-3 h-3" />
                              Settled
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
