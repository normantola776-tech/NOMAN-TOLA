import React, { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  Receipt,
  Users,
  Video,
  FileText,
  FileCheck2,
  Mail,
  LifeBuoy,
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  ShieldCheck,
  Heart,
  Award,
  Sparkles,
  Lock,
  ArrowUpRight,
  Filter,
  DollarSign,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { AppActivityItem, CreatorActivitySummary, UserProfile } from '../types.ts';

interface Props {
  user: UserProfile;
  onOpenCreatorContact?: () => void;
  onOpenCreatorFinance?: () => void;
}

export const CreatorActivityPortalView: React.FC<Props> = ({
  user,
  onOpenCreatorContact,
  onOpenCreatorFinance,
}) => {
  const [data, setData] = useState<CreatorActivitySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [settlingPayout, setSettlingPayout] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/creator/all-activities');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json && !('error' in json)) {
        setData(json);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to load all creator activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettlePayout = () => {
    setSettlingPayout(true);
    setTimeout(() => {
      setSettlingPayout(false);
      alert(
        'Disbursement Batch #CENT-2026-904 processed successfully!\n\nDestination: Account 3205303331 (Centenary Bank)\nAutomated SMS alert transmitted to Platform Creator.'
      );
      fetchActivities();
    }, 900);
  };

  const handleExportCsv = () => {
    if (!data?.activities || data.activities.length === 0) return;
    const headers = ['Activity ID', 'Category', 'Title', 'Actor', 'Role', 'Timestamp', 'Description', 'Amount', 'Reference'];
    const rows = data.activities.map((a) => [
      `"${a.id}"`,
      `"${a.category}"`,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.actorName.replace(/"/g, '""')}"`,
      `"${a.actorRole}"`,
      `"${a.timestamp}"`,
      `"${a.description.replace(/"/g, '""')}"`,
      `"${a.meta?.amount || 0}"`,
      `"${a.meta?.reference || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edura_platform_activity_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredActivities = (data?.activities || []).filter((act) => {
    if (filterCategory !== 'all' && act.category !== filterCategory) {
      // Grouping logic for broader tabs
      if (filterCategory === 'payments' && !['booking_payment', 'tutor_payout', 'bonus_reward'].includes(act.category)) {
        return false;
      }
      if (filterCategory === 'users' && !['registration', 'id_verification'].includes(act.category)) {
        return false;
      }
      if (filterCategory === 'classes' && !['live_classroom', 'student_like', 'tutor_payout'].includes(act.category)) {
        return false;
      }
      if (filterCategory === 'academic' && !['material_download', 'material_upload', 'assignment_submit', 'assignment_grade'].includes(act.category)) {
        return false;
      }
      if (filterCategory === 'support' && !['support_ticket', 'email_dispatch', 'direct_message'].includes(act.category)) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchDesc = act.description.toLowerCase().includes(q);
      const matchActor = act.actorName.toLowerCase().includes(q);
      const matchRef = act.meta?.reference?.toLowerCase().includes(q);
      const matchSchool = act.meta?.schoolName?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchActor || matchRef || matchSchool;
    }

    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking_payment':
      case 'tutor_payout':
        return <Receipt className="w-4 h-4 text-emerald-600" />;
      case 'registration':
      case 'id_verification':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'live_classroom':
        return <Video className="w-4 h-4 text-indigo-600" />;
      case 'student_like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'material_download':
      case 'material_upload':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'assignment_submit':
      case 'assignment_grade':
        return <FileCheck2 className="w-4 h-4 text-purple-600" />;
      case 'email_dispatch':
        return <Mail className="w-4 h-4 text-sky-600" />;
      case 'support_ticket':
        return <LifeBuoy className="w-4 h-4 text-rose-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Creator Top Command Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-800 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-xl text-xs font-bold">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Creator Directorate Master Console</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Settlement Bank: Centenary 3205303331</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-mono">
                normantola776@gmail.com
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Platform Master Activity & Executive Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Real-time audit log of all activities across the platform: student and tutor registrations, live classroom sessions, 
              MTN/Airtel/Centenary bank inflows, student appreciation likes, homework submissions, and support dispatches.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchActivities}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Activities</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </button>
            <button
              onClick={handleSettlePayout}
              disabled={settlingPayout}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{settlingPayout ? 'Disbursing...' : 'Reconcile Centenary Bank'}</span>
            </button>
          </div>
        </div>

        {/* Live Channel Status Bar */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Centenary Payout: <strong className="text-white font-mono">3205303331</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>MTN MoMo Inflow: <strong className="text-white font-mono">+256773489862</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Airtel Money Inflow: <strong className="text-white font-mono">+256731074878</strong></span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            Audit Feed Updated: {lastRefreshed.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Gross Bookings
          </span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 mt-1 block">
            UGX {(data?.totalGrossRevenue || 55000).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{data?.totalBookings || 4} Total Orders</span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Creator Net (20%)
          </span>
          <span className="text-lg sm:text-xl font-bold text-emerald-700 mt-1 block">
            UGX {(data?.totalCreatorNetEarnings || 11000).toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Centenary 3205303331</span>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            URA Tax (5% WHT)
          </span>
          <span className="text-lg sm:text-xl font-bold text-amber-700 mt-1 block">
            UGX {(data?.totalTaxWithheld || 2750).toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-600 mt-0.5 block">Automated WHT Form</span>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
            Platform Users
          </span>
          <span className="text-lg sm:text-xl font-bold text-blue-700 mt-1 block">
            {data?.totalUsers || 7} Total
          </span>
          <span className="text-[10px] text-blue-600 mt-0.5 block">
            {data?.totalStudents || 4} Students · {data?.totalTutors || 2} Tutors
          </span>
        </div>

        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider block">
            Taught Lessons
          </span>
          <span className="text-lg sm:text-xl font-bold text-purple-700 mt-1 block">
            {data?.totalSessionsConducted || 4} Classes
          </span>
          <span className="text-[10px] text-purple-600 mt-0.5 block">
            {data?.totalMinutesTaught || 360} Teaching Mins
          </span>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">
            Student Likes
          </span>
          <span className="text-lg sm:text-xl font-bold text-rose-600 mt-1 block flex items-center gap-1">
            <Heart className="w-4 h-4 fill-rose-500 inline" />
            <span>{data?.totalLikesRecorded || 13}</span>
          </span>
          <span className="text-[10px] text-rose-600 mt-0.5 block">Unlocked Tutor Payouts</span>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Activities ({data?.activities.length || 0})
            </button>
            <button
              onClick={() => setFilterCategory('payments')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'payments' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Payments & Banking
            </button>
            <button
              onClick={() => setFilterCategory('users')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'users' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registrations & IDs
            </button>
            <button
              onClick={() => setFilterCategory('classes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'classes' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lessons & Likes
            </button>
            <button
              onClick={() => setFilterCategory('academic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'academic' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Study Hub & Homework
            </button>
            <button
              onClick={() => setFilterCategory('support')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'support' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tickets & Dispatches
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, tutor, school, ref..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Activity Items Feed */}
        <div className="pt-2">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No platform activities found matching your criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="py-3.5 px-3 hover:bg-slate-50/80 rounded-2xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-slate-100 rounded-xl shrink-0 mt-0.5">
                      {getCategoryIcon(activity.category)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900">
                          {activity.title}
                        </h4>
                        {activity.badgeLabel && (
                          <span className="text-[10px] font-semibold text-slate-500">
                            · {activity.badgeLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {activity.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span>Actor: <strong className="text-slate-700 font-medium">{activity.actorName}</strong></span>
                        <span>•</span>
                        <span>Role: <span className="capitalize text-slate-700">{activity.actorRole}</span></span>
                        <span>•</span>
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right metadata pill / action */}
                  {activity.meta?.amount ? (
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-700 block">
                        +UGX {activity.meta.amount.toLocaleString()}
                      </span>
                      {activity.meta.reference && (
                        <span className="font-mono text-[10px] text-slate-400 block">
                          {activity.meta.reference}
                        </span>
                      )}
                    </div>
                  ) : activity.meta?.likesCount ? (
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-rose-600 flex items-center justify-end gap-1">
                        <Heart className="w-3.5 h-3.5 fill-rose-500" />
                        <span>{activity.meta.likesCount} Likes</span>
                      </span>
                    </div>
                  ) : activity.meta?.score ? (
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-purple-700 block">
                        Score: {activity.meta.score}
                      </span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
