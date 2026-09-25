import React, { useState } from 'react';
import { CreditCard, Smartphone, Building2, CheckCircle2, ShieldAlert, ArrowRight, Lock, X, Sparkles, Copy, Check } from 'lucide-react';
import {
  TutoringSession,
  UserProfile,
  OFFICIAL_PAYMENT_CONFIG,
  getSubjectTrack,
  getStandardHourlyRate,
} from '../types.ts';

interface Props {
  session: TutoringSession;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (bookingResult: any) => void;
}

export const PaymentModal: React.FC<Props> = ({
  session,
  user,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'MTN' | 'Airtel' | 'Centenary Bank'>('MTN');
  const [studentPhone, setStudentPhone] = useState('+256 700 000 000');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'authenticating' | 'confirmed'>('details');
  const [confirmationData, setConfirmationData] = useState<any>(null);

  if (!isOpen) return null;

  const activeOfficialNumber =
    selectedMethod === 'MTN'
      ? OFFICIAL_PAYMENT_CONFIG.mtnNumber
      : selectedMethod === 'Airtel'
      ? OFFICIAL_PAYMENT_CONFIG.airtelNumber
      : OFFICIAL_PAYMENT_CONFIG.centenaryAccount;

  const track = getSubjectTrack(session.subject);
  const standardHourlyRate = getStandardHourlyRate(session.subject);

  const handleCopy = () => {
    navigator.clipboard?.writeText(activeOfficialNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handlePay = async () => {
    setProcessing(true);
    setStep('authenticating');

    try {
      // Simulate gateway authorization handshake with telecom switch
      await new Promise((r) => setTimeout(r, 1200));

      const res = await fetch('/api/sessions/book-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          studentId: user.id,
          studentName: user.fullName,
          paymentMethod:
            selectedMethod === 'MTN'
              ? 'MTN Mobile Money'
              : selectedMethod === 'Airtel'
              ? 'Airtel Money'
              : 'Centenary Bank Pesa',
          amount: session.price,
          accountNumberOrPhone: activeOfficialNumber,
          payerPhone: studentPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      setConfirmationData(data);
      setStep('confirmed');
      onPaymentSuccess(data);
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
      setStep('details');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-2xl">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Secure Payment & Session Pass</h3>
              <p className="text-xs text-slate-300">Live Video & Audio Masterclass</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'details' && (
          <div className="p-6 space-y-5 text-slate-800">
            {/* Session Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full uppercase tracking-wider">
                    {session.subject}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      track === 'Science'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {track} Track • UGX {standardHourlyRate.toLocaleString()}/hr
                  </span>
                </div>
                <span className="text-lg font-black text-slate-900">
                  UGX {session.price.toLocaleString()}
                </span>
              </div>
              <h4 className="font-semibold text-sm text-slate-900">{session.title}</h4>
              <p className="text-xs text-slate-500">
                Duration: {session.durationMinutes} mins • High-Definition Video & Live Audio
              </p>
            </div>

            {/* Gateway Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Official Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {/* MTN */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('MTN')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedMethod === 'MTN'
                      ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                    MTN
                  </div>
                  <span className="text-xs font-bold text-slate-900">MTN MoMo</span>
                  <span className="text-[10px] font-mono text-slate-600 font-semibold">
                    {OFFICIAL_PAYMENT_CONFIG.mtnNumber}
                  </span>
                </button>

                {/* Airtel */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('Airtel')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedMethod === 'Airtel'
                      ? 'border-red-500 bg-red-50/70 ring-2 ring-red-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    Airtel
                  </div>
                  <span className="text-xs font-bold text-slate-900">Airtel Money</span>
                  <span className="text-[10px] font-mono text-slate-600 font-semibold">
                    {OFFICIAL_PAYMENT_CONFIG.airtelNumber}
                  </span>
                </button>

                {/* Centenary Bank */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('Centenary Bank')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedMethod === 'Centenary Bank'
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Centenary</span>
                  <span className="text-[10px] font-mono text-slate-600 font-semibold">
                    3205303331
                  </span>
                </button>
              </div>
            </div>

            {/* Official Receiver Details Banner */}
            <div
              className={`p-3.5 rounded-2xl border transition-all text-xs ${
                selectedMethod === 'MTN'
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                  : selectedMethod === 'Airtel'
                  ? 'bg-red-50/80 border-red-300 text-red-950'
                  : 'bg-blue-50/80 border-blue-300 text-blue-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                    Official {selectedMethod} Payment Line
                  </span>
                  <div className="text-base font-mono font-bold mt-0.5 tracking-wide">
                    {activeOfficialNumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 bg-white/90 hover:bg-white rounded-xl shadow-xs text-[11px] font-semibold flex items-center gap-1 transition-all"
                >
                  {copiedNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-[11px] opacity-85 leading-relaxed">
                {selectedMethod === 'MTN' &&
                  `Send payment directly to MTN line ${OFFICIAL_PAYMENT_CONFIG.mtnNumber}, or authorize the USSD push prompt below.`}
                {selectedMethod === 'Airtel' &&
                  `Send payment directly to Airtel line ${OFFICIAL_PAYMENT_CONFIG.airtelNumber}, or authorize the USSD push prompt below.`}
                {selectedMethod === 'Centenary Bank' &&
                  `Direct bank transfer / Pesa link to Centenary Bank Account 3205303331.`}
              </p>
            </div>

            {/* Payer Phone Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Your Student / Sponsor Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="+256 7XX XXX XXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
                <div className="absolute right-3 top-2.5 text-xs font-semibold text-blue-600">
                  Ready
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                A verification USSD prompt will be sent to your phone for approval.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handlePay}
                disabled={processing}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Authorize & Pay UGX {session.price.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'authenticating' && (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Authorizing with {selectedMethod}...
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Requesting authorization to destination{' '}
                <span className="font-mono font-bold text-slate-800">{activeOfficialNumber}</span>.
                Please approve on your phone.
              </p>
            </div>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">Payment Approved!</h4>
              <p className="text-xs text-slate-500 mt-1">
                Your special session video & audio pass has been unlocked.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-800">
                  {confirmationData?.transactionRef || 'TXN-APPROVED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class Access Pass:</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {confirmationData?.accessCode || 'ACC-SPECIAL-PASS'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Official Channel:</span>
                <span className="font-mono font-semibold text-slate-700">
                  {selectedMethod} ({activeOfficialNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pricing Applied:</span>
                <span className="font-medium text-slate-700">
                  {track} Track (UGX {standardHourlyRate.toLocaleString()}/hr)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold text-sm shadow-md transition-all"
            >
              Enter Live Classroom Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
