import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Lock,
  X,
  Sparkles,
  Copy,
  Check,
  BellRing,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Edit2,
  AlertCircle,
  PhoneCall,
  MessageSquare,
} from 'lucide-react';
import {
  TutoringSession,
  UserProfile,
  OFFICIAL_PAYMENT_CONFIG,
  getSubjectTrack,
} from '../types.ts';

interface Props {
  session: TutoringSession;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (bookingResult: any) => void;
  onTriggerNotification?: (
    title: string,
    message: string,
    type: 'session' | 'assignment' | 'grade'
  ) => void;
}

export const PaymentModal: React.FC<Props> = ({
  session,
  user,
  isOpen,
  onClose,
  onPaymentSuccess,
  onTriggerNotification,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'MTN' | 'Airtel' | 'Centenary Bank'>('MTN');
  const [studentPhone, setStudentPhone] = useState('+256 772 849 201');
  const [useBonusVoucher, setUseBonusVoucher] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Steps: 'details' -> 'pin_verification' -> 'authenticating' -> 'confirmed'
  const [step, setStep] = useState<'details' | 'pin_verification' | 'authenticating' | 'confirmed'>('details');

  // PIN Verification State
  const [verificationId, setVerificationId] = useState<string>('');
  const [generatedPin, setGeneratedPin] = useState<string>('');
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [phoneNotificationBanner, setPhoneNotificationBanner] = useState<{
    phone: string;
    pin: string;
    text: string;
    timestamp: string;
  } | null>(null);
  const [pinCountdown, setPinCountdown] = useState<number>(60);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<any>(null);

  // Input refs for 4-digit PIN boxes
  const digitInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Countdown timer for resending PIN
  useEffect(() => {
    let timer: any;
    if (step === 'pin_verification' && pinCountdown > 0) {
      timer = setInterval(() => {
        setPinCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, pinCountdown]);

  if (!isOpen) return null;

  const track = getSubjectTrack(session.subject);
  const hasBonusAvailable = (user.bonusSessionsCount ?? 0) > 0;
  const effectivePrice = useBonusVoucher ? 0 : session.price;

  const activeOfficialNumber =
    selectedMethod === 'MTN'
      ? OFFICIAL_PAYMENT_CONFIG.mtnNumber
      : selectedMethod === 'Airtel'
      ? OFFICIAL_PAYMENT_CONFIG.airtelNumber
      : OFFICIAL_PAYMENT_CONFIG.centenaryAccount;

  const handleCopyReceiverNumber = () => {
    navigator.clipboard?.writeText(activeOfficialNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleCopyPin = (pinToCopy: string) => {
    navigator.clipboard?.writeText(pinToCopy);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  // 1. Request PIN Notification to Phone Number
  const handleRequestPin = async () => {
    if (!studentPhone.trim()) {
      setErrorMessage('Please enter a valid mobile phone number to receive the PIN notification');
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/payment/request-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: studentPhone.trim(),
          amount: effectivePrice,
          paymentMethod: useBonusVoucher
            ? 'First-Time Bonus Voucher (100% Free)'
            : selectedMethod === 'MTN'
            ? 'MTN Mobile Money'
            : selectedMethod === 'Airtel'
            ? 'Airtel Money'
            : 'Centenary Bank Pesa',
          studentName: user.fullName,
          sessionId: session.id,
          studentId: user.id,
          useBonusSession: useBonusVoucher,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch verification PIN');

      setVerificationId(data.verificationId);
      setGeneratedPin(data.pin);
      setPinDigits(['', '', '', '']);
      setPinCountdown(60);

      // Trigger realistic phone notification banner
      const bannerData = {
        phone: data.phone,
        pin: data.pin,
        text: data.notificationText || `Edura High PIN: Your payment verification PIN is ${data.pin}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setPhoneNotificationBanner(bannerData);

      // Trigger app-level push notification & vibration
      if (onTriggerNotification) {
        onTriggerNotification(
          `Payment Verification PIN: ${data.pin} 📲`,
          `Notification dispatched to ${data.phone} for UGX ${effectivePrice.toLocaleString()} session pass. Enter this PIN to verify.`,
          'session'
        );
      }
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      } catch (_) {}

      setStep('pin_verification');
      setTimeout(() => {
        digitInputRefs[0].current?.focus();
      }, 200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error requesting verification PIN notification');
    } finally {
      setProcessing(false);
    }
  };

  // Handle digit typing in PIN boxes
  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = cleanVal;
    setPinDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance to next box if digit entered
    if (cleanVal && index < 3) {
      digitInputRefs[index + 1].current?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      digitInputRefs[index - 1].current?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData) {
      const newDigits = ['', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setPinDigits(newDigits);
      if (pastedData.length >= 4) {
        digitInputRefs[3].current?.focus();
      } else {
        digitInputRefs[pastedData.length].current?.focus();
      }
    }
  };

  // Auto-fill PIN directly from received phone notification
  const handleAutoFillPin = () => {
    if (generatedPin && generatedPin.length === 4) {
      const chars = generatedPin.split('');
      setPinDigits(chars);
      digitInputRefs[3].current?.focus();
    }
  };

  // 2. Verify PIN & Finalize Payment
  const handleVerifyPinAndPay = async () => {
    const fullPin = pinDigits.join('');
    if (fullPin.length < 4) {
      setErrorMessage('Please enter the complete 4-digit verification PIN received on your phone.');
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/payment/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          pin: fullPin,
          sessionId: session.id,
          studentId: user.id,
          studentName: user.fullName,
          paymentMethod: useBonusVoucher
            ? 'First-Time Bonus Voucher (100% Free)'
            : selectedMethod === 'MTN'
            ? 'MTN Mobile Money'
            : selectedMethod === 'Airtel'
            ? 'Airtel Money'
            : 'Centenary Bank Pesa',
          amount: effectivePrice,
          payerPhone: studentPhone,
          useBonusSession: useBonusVoucher,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification PIN code. Please check your phone SMS.');
      }

      // Transition to authenticating momentarily for realistic switch settlement
      setStep('authenticating');
      await new Promise((r) => setTimeout(r, 900));

      setConfirmationData(data);
      setStep('confirmed');
      onPaymentSuccess(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'PIN verification failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-2xl">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-base flex items-center gap-2">
                <span>Secure Telecom Payment & Access Pass</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  2FA Verified
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Official MoMo & Centenary Bank Gateway with Phone PIN Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: PAYMENT DETAILS & PHONE INPUT */}
        {step === 'details' && (
          <div className="p-6 space-y-4 text-slate-800 overflow-y-auto">
            {/* Session Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full uppercase tracking-wider">
                    {session.subject}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      track === 'Science'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {track} Track • UGX {session.price.toLocaleString()} / 1 1/2 hr (90 min)
                  </span>
                </div>
                <span className="text-lg font-black text-slate-900">
                  {useBonusVoucher ? (
                    <span className="text-emerald-600 font-bold">FREE (0 UGX)</span>
                  ) : (
                    `UGX ${session.price.toLocaleString()}`
                  )}
                </span>
              </div>
              <h4 className="font-semibold text-sm text-slate-900">{session.title}</h4>
              <p className="text-xs text-slate-500">
                Duration: {session.durationMinutes} mins (1 1/2 hr) • Live Audio/Video Stream with verified teacher
              </p>
            </div>

            {/* Bonus Voucher Notification */}
            {hasBonusAvailable ? (
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500 text-white rounded-xl">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-amber-950">
                      1 Free Bonus Session Voucher Available!
                    </h5>
                    <p className="text-[11px] text-amber-800">
                      Awarded from your first order. Redeem now for 100% free access!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUseBonusVoucher(!useBonusVoucher)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    useBonusVoucher
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-amber-400 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  {useBonusVoucher ? '✓ Voucher Applied' : 'Apply Voucher'}
                </button>
              </div>
            ) : (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-2.5 text-xs text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>First-Time Student Bonus:</strong> Complete this session order to automatically receive <strong>1 FREE Bonus 1 1/2 hr Session Voucher</strong>!
                </span>
              </div>
            )}

            {/* Method Selection */}
            {!useBonusVoucher && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Official Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* MTN */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('MTN')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
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
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
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
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
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
            )}

            {/* Official Receiver Details Banner */}
            <div
              className={`p-3 rounded-2xl border transition-all text-xs ${
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
                    Official Receiver {selectedMethod} Channel
                  </span>
                  <div className="text-sm font-mono font-bold mt-0.5 tracking-wide">
                    {activeOfficialNumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyReceiverNumber}
                  className="px-2.5 py-1 bg-white/90 hover:bg-white rounded-xl shadow-xs text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Student/Sponsor Phone Number Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Student / Sponsor Mobile Phone Number</span>
                </label>
                <span className="text-[10px] text-blue-600 font-semibold">
                  Receives Verification PIN
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={studentPhone}
                  onChange={(e) => {
                    setStudentPhone(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="+256 7XX XXX XXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono tracking-wide text-slate-900 bg-slate-50 focus:bg-white"
                />
                <div className="absolute right-2.5 top-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  SMS Enabled
                </div>
              </div>

              {/* Quick phone number selector presets for easy user testing */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-slate-500">Quick presets:</span>
                <button
                  type="button"
                  onClick={() => setStudentPhone('+256 772 849 201')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  MTN (+256 772)
                </button>
                <button
                  type="button"
                  onClick={() => setStudentPhone('+256 701 553 920')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Airtel (+256 701)
                </button>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2 text-[11px] text-amber-900 mt-2">
                <BellRing className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>PIN Security Requirement:</strong> A one-time verification PIN will be dispatched to this mobile phone number. You must enter this PIN to authorize the payment transaction.
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleRequestPin}
                disabled={processing}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching PIN Notification...</span>
                  </span>
                ) : (
                  <>
                    <span>
                      {useBonusVoucher
                        ? 'Verify Phone & Redeem Free Session'
                        : `Proceed & Receive PIN on Phone (UGX ${session.price.toLocaleString()})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PHONE PIN NOTIFICATION RECEIVED & VERIFICATION */}
        {step === 'pin_verification' && (
          <div className="p-6 space-y-4 text-slate-800 overflow-y-auto">
            {/* Incoming Phone Notification Card */}
            {phoneNotificationBanner && (
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-xl border border-indigo-400/40 relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                      <MessageSquare className="w-4 h-4 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Incoming SMS / MoMo Notification
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {phoneNotificationBanner.timestamp}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                        <span>Delivered to:</span>
                        <span className="font-mono text-amber-300">
                          {phoneNotificationBanner.phone}
                        </span>
                      </h5>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 bg-blue-500/30 border border-blue-400/40 text-[10px] font-bold rounded-md text-blue-200">
                    2FA Security
                  </span>
                </div>

                <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    "{phoneNotificationBanner.text}"
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Your Verification PIN:</span>
                      <span className="font-mono text-base font-extrabold tracking-widest text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-300/30">
                        {phoneNotificationBanner.pin}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyPin(phoneNotificationBanner.pin)}
                        className="px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedPin ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-300">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy PIN</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleAutoFillPin}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-[10px] shadow-sm flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-Fill PIN</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instruction & Phone Number change */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Enter 4-Digit Verification PIN</span>
              </div>
              <p className="text-xs text-slate-600">
                Please enter the security PIN code received on{' '}
                <strong className="font-mono text-slate-900">{studentPhone}</strong>
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep('details');
                  setErrorMessage(null);
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 underline underline-offset-2 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Wrong phone number? Change number</span>
              </button>
            </div>

            {/* 4 Large Digit Input Boxes */}
            <div className="flex justify-center items-center gap-3 py-2" onPaste={handleDigitPaste}>
              {pinDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={digitInputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  className={`w-14 h-16 text-center font-mono text-2xl font-black rounded-2xl border-2 transition-all shadow-xs focus:outline-hidden ${
                    digit
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white'
                  }`}
                />
              ))}
            </div>

            {/* Error Message if wrong PIN */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Resend PIN countdown & trigger */}
            <div className="flex items-center justify-between px-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <span>Code valid for:</span>
                <strong className="font-mono text-slate-700 font-bold">
                  {pinCountdown > 0 ? `${pinCountdown}s` : 'Expired'}
                </strong>
              </span>

              <button
                type="button"
                onClick={handleRequestPin}
                disabled={processing || pinCountdown > 35}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${processing ? 'animate-spin' : ''}`} />
                <span>Resend PIN Notification</span>
              </button>
            </div>

            {/* Verify PIN and Complete Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleVerifyPinAndPay}
                disabled={processing || pinDigits.join('').length < 4}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying PIN Code & Authorizing...</span>
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify PIN & Confirm Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AUTHENTICATING / GATEWAY HANDSHAKE */}
        {step === 'authenticating' && (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-emerald-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                PIN Verified! Finalizing Transaction...
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Authorizing payment with {selectedMethod} switch and issuing your official classroom access pass.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMED & UNLOCKED ACCESS */}
        {step === 'confirmed' && (
          <div className="p-6 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">
                Payment Approved & Access Pass Unlocked!
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Your 1 1/2 hr live masterclass video & audio room is now active.
              </p>
            </div>

            {/* Verified Phone Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Mobile Number:</span>
              <span className="font-mono font-bold text-emerald-950">
                {confirmationData?.verifiedPhone || studentPhone}
              </span>
              <span className="text-[10px] bg-emerald-200/80 px-1.5 py-0.5 rounded-sm font-bold">
                PIN Authenticated
              </span>
            </div>

            {/* First-time bonus badge if awarded */}
            {confirmationData?.firstOrderBonusGranted && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-left flex items-center gap-3">
                <span className="text-xl">🎁</span>
                <div>
                  <h5 className="font-bold text-xs text-amber-950">
                    First Order Bonus Awarded!
                  </h5>
                  <p className="text-[11px] text-amber-800">
                    1 Free Bonus Session Voucher has been credited to your student account for your next class!
                  </p>
                </div>
              </div>
            )}

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
                  {useBonusVoucher ? 'Bonus Voucher (Free)' : `${selectedMethod} (${activeOfficialNumber})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Official Pricing:</span>
                <span className="font-medium text-slate-700">
                  {track} Track (UGX {session.price.toLocaleString()} / 1 1/2 hr)
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 text-[11px]">
                <span className="text-slate-500">Notification Dispatch:</span>
                <span className="font-semibold text-blue-700">
                  Sent to normantola776@gmail.com & {studentPhone}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Enter Live Classroom Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
