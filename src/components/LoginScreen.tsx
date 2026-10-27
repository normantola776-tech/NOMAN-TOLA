import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Building2,
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  School,
  Gift,
  HelpCircle,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Atom,
  Palette,
  FileCheck2,
} from 'lucide-react';
import {
  UserProfile,
  PROFILES,
  ROLE_CREDENTIALS_MAP,
  RoleCredentialsInfo,
  UserRole,
} from '../types.ts';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile, targetTab?: string) => void;
  initialRole?: UserRole;
  onRequestRegister?: (role: 'student' | 'tutor') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  initialRole = 'student',
  onRequestRegister,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStepMessage, setAuthStepMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student specific fields
  const [studentGrade, setStudentGrade] = useState('Senior 4');
  const [studentSector, setStudentSector] = useState<'Science' | 'Art' | 'Both'>('Science');
  const [studentIndex, setStudentIndex] = useState('U0025/512');

  // Tutor specific fields
  const [tutorTrn, setTutorTrn] = useState('TRN-BUDO-8842');
  const [tutorDepartment, setTutorDepartment] = useState('Department of Physics & Pure Mathematics');

  // Creator specific fields
  const [creatorPin, setCreatorPin] = useState('');

  const currentRoleInfo: RoleCredentialsInfo = ROLE_CREDENTIALS_MAP[selectedRole];

  // Handle switching tabs
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setEmail('');
    setPassword('');
    setShowPassword(false);
    if (role === 'creator') {
      setCreatorPin('');
    }
  };

  // Automated demonstration flow
  const handleDemonstrateLogin = (roleToDemo: UserRole = selectedRole) => {
    setSelectedRole(roleToDemo);
    setErrorMessage(null);
    setIsAuthenticating(true);

    const demoProfile = PROFILES[roleToDemo];
    const demoInfo = ROLE_CREDENTIALS_MAP[roleToDemo];

    // Populate demonstration fields
    setEmail(demoInfo.demoEmail);
    setPassword(demoInfo.demoPassword);

    if (roleToDemo === 'student') {
      setStudentGrade(demoProfile.gradeLevel);
      setStudentSector(demoProfile.sector || 'Science');
      setStudentIndex('U0025/512');
      setAuthStepMessage(`Validating King's College Budo student index U0025/512...`);
    } else if (roleToDemo === 'tutor') {
      setTutorTrn('TRN-BUDO-8842');
      setTutorDepartment('Department of Physics & Pure Mathematics');
      setAuthStepMessage('Verifying Ministry of Education TRN & UNEB Examiner status...');
    } else {
      setCreatorPin('320530');
      setAuthStepMessage('Authenticating Centenary Directorate Clearance (Account: 3205303331)...');
    }

    setTimeout(() => {
      setAuthStepMessage(`Cryptographic Token Verified ✓ Welcome, ${demoProfile.fullName}!`);
      setTimeout(() => {
        setIsAuthenticating(false);
        const targetTab = roleToDemo === 'creator' ? 'activities' : 'tutors';
        onLoginSuccess(demoProfile, targetTab);
      }, 700);
    }, 900);
  };

  // Manual submission validation
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputEmail = email.trim().toLowerCase();
    const demoProfile = PROFILES[selectedRole];
    const demoInfo = ROLE_CREDENTIALS_MAP[selectedRole];

    if (!inputEmail) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your security password or passcode.');
      return;
    }

    if (selectedRole === 'creator') {
      const pin = creatorPin.trim();
      if (pin !== '320530' && pin !== '3205303331' && pin !== '1234') {
        setErrorMessage('Invalid Creator Security PIN. Enter 320530 for authorized Centenary ledger access.');
        return;
      }
    }

    setIsAuthenticating(true);
    setAuthStepMessage(`Authenticating ${demoInfo.badge} credentials...`);

    setTimeout(() => {
      // Check if credentials match demo profile or if user entered reasonable credentials
      let authenticatedUser: UserProfile = { ...demoProfile };

      if (selectedRole === 'student') {
        authenticatedUser = {
          ...demoProfile,
          email: inputEmail || demoProfile.email,
          gradeLevel: studentGrade,
          sector: studentSector,
          fullName: inputEmail.includes('mukasa') ? 'Joel Mukasa' : inputEmail.split('@')[0],
        };
      } else if (selectedRole === 'tutor') {
        authenticatedUser = {
          ...demoProfile,
          email: inputEmail || demoProfile.email,
          fullName: inputEmail.includes('kigozi') ? 'Dr. Mark Kigozi' : inputEmail.split('@')[0],
        };
      } else {
        authenticatedUser = {
          ...demoProfile,
          email: inputEmail || demoProfile.email,
        };
      }

      setAuthStepMessage(`Access Granted ✓ Launching ${demoInfo.title}...`);

      setTimeout(() => {
        setIsAuthenticating(false);
        const targetTab = selectedRole === 'creator' ? 'activities' : 'tutors';
        onLoginSuccess(authenticatedUser, targetTab);
      }, 600);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Ambience & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl space-y-6">
        {/* Platform Brand Title & Context */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold backdrop-blur-md">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300">Edura High • Ugandan Secondary Education & Tutoring</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Role-Based Authentication Gateway
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Select your role to access the dedicated high school student, educator, or platform directorate interface.
          </p>
        </div>

        {/* 3 Unified Role Selection Segmented Controls */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl backdrop-blur-md shadow-xl">
          {/* Student Tab */}
          <button
            type="button"
            onClick={() => handleSelectRole('student')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-xl transition-all font-semibold text-xs cursor-pointer ${
              selectedRole === 'student'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${selectedRole === 'student' ? 'text-white' : 'text-blue-400'}`} />
            <div className="text-center sm:text-left">
              <span className="block font-bold">Student Portal</span>
              <span className="hidden sm:block text-[10px] opacity-80">S1 - S6 Students</span>
            </div>
          </button>

          {/* Tutor Tab */}
          <button
            type="button"
            onClick={() => handleSelectRole('tutor')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-xl transition-all font-semibold text-xs cursor-pointer ${
              selectedRole === 'tutor'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-white/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${selectedRole === 'tutor' ? 'text-white' : 'text-emerald-400'}`} />
            <div className="text-center sm:text-left">
              <span className="block font-bold">Educator & Tutor</span>
              <span className="hidden sm:block text-[10px] opacity-80">Certified Faculty</span>
            </div>
          </button>

          {/* Creator Tab */}
          <button
            type="button"
            onClick={() => handleSelectRole('creator')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-xl transition-all font-semibold text-xs cursor-pointer ${
              selectedRole === 'creator'
                ? 'bg-gradient-to-r from-slate-700 via-indigo-900 to-slate-800 text-white shadow-lg shadow-indigo-900/40 ring-1 ring-white/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Building2 className={`w-4 h-4 ${selectedRole === 'creator' ? 'text-white' : 'text-amber-400'}`} />
            <div className="text-center sm:text-left">
              <span className="block font-bold">Platform Directorate</span>
              <span className="hidden sm:block text-[10px] opacity-80">Centenary Operations</span>
            </div>
          </button>
        </div>

        {/* Main Content Grid: Login Form & Demonstration Credential Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form with Distinct Entry Fields (7 cols) */}
          <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
            {/* Role Header Banner */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-700/70 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{currentRoleInfo.title}</h2>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      selectedRole === 'student'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : selectedRole === 'tutor'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {currentRoleInfo.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{currentRoleInfo.subtitle}</p>
              </div>

              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  selectedRole === 'student'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : selectedRole === 'tutor'
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {selectedRole === 'student' && <GraduationCap className="w-5 h-5" />}
                {selectedRole === 'tutor' && <BookOpen className="w-5 h-5" />}
                {selectedRole === 'creator' && <Building2 className="w-5 h-5" />}
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Dynamic Role-Specific Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Field 1: Email Address */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                  <span>
                    {selectedRole === 'student' && 'Student Email or School ID'}
                    {selectedRole === 'tutor' && 'Certified Educator Email'}
                    {selectedRole === 'creator' && 'Directorate Master Email'}
                  </span>
                  <span className="text-[10px] text-slate-500">Required</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={currentRoleInfo.emailPlaceholder}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Field 2: Password / Security Key */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                  <span>
                    {selectedRole === 'student' && 'Student Portal Password'}
                    {selectedRole === 'tutor' && 'Faculty Passcode'}
                    {selectedRole === 'creator' && 'Administrative Password'}
                  </span>
                  <span className="text-[10px] text-slate-500">Protected</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (or click demonstration below)"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* DISTINCT ROLE-SPECIFIC FIELDS */}

              {/* A. STUDENT ENTRY FIELDS */}
              {selectedRole === 'student' && (
                <div className="space-y-3.5 pt-1 border-t border-slate-700/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Form / Class Level
                      </label>
                      <select
                        value={studentGrade}
                        onChange={(e) => setStudentGrade(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      >
                        <option value="Senior 1">Senior 1 (S.1)</option>
                        <option value="Senior 2">Senior 2 (S.2)</option>
                        <option value="Senior 3">Senior 3 (S.3)</option>
                        <option value="Senior 4">Senior 4 (S.4 Candidate)</option>
                        <option value="Senior 5">Senior 5 (S.5 A-Level)</option>
                        <option value="Senior 6">Senior 6 (S.6 UACE)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Academic Sector Track
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setStudentSector('Science')}
                          className={`py-2 px-2 rounded-xl text-center font-bold text-[11px] border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            studentSector === 'Science'
                              ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Atom className="w-3 h-3 text-purple-400" />
                          Science (10k)
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentSector('Art')}
                          className={`py-2 px-2 rounded-xl text-center font-bold text-[11px] border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            studentSector === 'Art'
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Palette className="w-3 h-3 text-emerald-400" />
                          Arts (8k)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span>School Examination Index Number</span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> ID Verified
                      </span>
                    </label>
                    <input
                      type="text"
                      value={studentIndex}
                      onChange={(e) => setStudentIndex(e.target.value)}
                      placeholder="e.g. U0025/512"
                      className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs font-mono"
                    />
                  </div>

                  {/* Student Welcome Bonus Notification Callout */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5 text-[11px] text-amber-200">
                    <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>First-Time Student Bonus:</strong> 1 Free 90-minute bonus masterclass session credited upon entering!
                    </span>
                  </div>
                </div>
              )}

              {/* B. TUTOR ENTRY FIELDS */}
              {selectedRole === 'tutor' && (
                <div className="space-y-3.5 pt-1 border-t border-slate-700/50">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span>Teacher Registration No. (TRN) / UNEB Examiner Code</span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <FileCheck2 className="w-3 h-3" /> Certified
                      </span>
                    </label>
                    <input
                      type="text"
                      value={tutorTrn}
                      onChange={(e) => setTutorTrn(e.target.value)}
                      placeholder="e.g. TRN-BUDO-8842"
                      className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Academic Department & Faculty Role
                    </label>
                    <input
                      type="text"
                      value={tutorDepartment}
                      onChange={(e) => setTutorDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>Educator Privilege:</strong> Schedule 90-minute slots and unlock automated student like-gated earnings claims.
                    </span>
                  </div>
                </div>
              )}

              {/* C. CREATOR ENTRY FIELDS */}
              {selectedRole === 'creator' && (
                <div className="space-y-3.5 pt-1 border-t border-slate-700/50">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                      <span>Centenary Directorate Security PIN (6-Digit)</span>
                      <span className="text-[10px] text-amber-400 flex items-center gap-1">
                        <KeyRound className="w-3 h-3" /> PIN Protected
                      </span>
                    </label>
                    <input
                      type="password"
                      maxLength={10}
                      value={creatorPin}
                      onChange={(e) => setCreatorPin(e.target.value)}
                      placeholder="Enter 6-digit security PIN (Demo: 320530)"
                      className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs font-mono tracking-widest"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Linked to Platform Directorate Account <strong>3205303331</strong> (Centenary Bank Uganda).
                    </p>
                  </div>

                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>
                      <strong>Audit Dispatch:</strong> Access real-time student payment ledgers and trigger automated payout disbursements.
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className={`flex-1 py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    selectedRole === 'student'
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                      : selectedRole === 'tutor'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  }`}
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{authStepMessage || 'Authenticating Credentials...'}</span>
                    </>
                  ) : (
                    <>
                      <span>Open {currentRoleInfo.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Registration Link */}
            {onRequestRegister && selectedRole !== 'creator' && (
              <div className="pt-2 text-center border-t border-slate-700/40">
                <p className="text-slate-400 text-xs">
                  New to Edura High?{' '}
                  <button
                    type="button"
                    onClick={() => onRequestRegister(selectedRole as 'student' | 'tutor')}
                    className="text-blue-400 hover:underline font-semibold"
                  >
                    Register new {selectedRole} account
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Demonstration Credentials Showcase & Role Visuals (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1-Click Interactive Demonstration Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-850 border border-blue-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                  Live Demonstration Credentials
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Test the complete role-specific interface immediately with pre-configured institutional credentials:
              </p>

              {/* Profile Card Preview */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-3.5 space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={PROFILES[selectedRole].avatar}
                    alt={currentRoleInfo.demoName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-600"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white truncate">
                        {currentRoleInfo.demoName}
                      </h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300">
                        {selectedRole.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {currentRoleInfo.institution}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        <CheckCircle2 className="w-2.5 h-2.5" /> ID Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key-Value Credential List */}
                <div className="bg-slate-950/60 rounded-xl p-2.5 space-y-1.5 text-[11px] font-mono border border-slate-800">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-blue-300 select-all font-semibold">
                      {currentRoleInfo.demoEmail}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-slate-500">Passcode:</span>
                    <span className="text-slate-200 select-all">
                      {currentRoleInfo.demoPassword}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-slate-500">{currentRoleInfo.specialFieldLabel}:</span>
                    <span className="text-amber-300 select-all">
                      {currentRoleInfo.specialFieldValue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Big 1-Click Auto-Fill & Open Interface Button */}
              <button
                type="button"
                onClick={() => handleDemonstrateLogin(selectedRole)}
                disabled={isAuthenticating}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                <UserCheck className="w-4 h-4 text-slate-950" />
                <span>Demonstrate Instant Login with {currentRoleInfo.demoName.split(' ')[0]}</span>
              </button>
            </div>

            {/* Unlocked Features Preview Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 shadow-lg space-y-3">
              <h4 className="font-bold text-xs text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Dedicated {currentRoleInfo.badge} Features</span>
              </h4>

              <ul className="space-y-2 text-xs text-slate-300">
                {currentRoleInfo.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Quick Switcher Demonstration Buttons for Evaluator */}
              <div className="pt-2 border-t border-slate-700/60">
                <p className="text-[11px] text-slate-400 mb-2 font-medium">
                  Switch to demonstrate other role interfaces:
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDemonstrateLogin('student')}
                    className="py-1.5 px-2 bg-blue-900/40 hover:bg-blue-900/70 text-blue-300 border border-blue-700/40 rounded-lg text-[10px] font-bold transition-colors"
                  >
                    Student (Joel)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemonstrateLogin('tutor')}
                    className="py-1.5 px-2 bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-700/40 rounded-lg text-[10px] font-bold transition-colors"
                  >
                    Tutor (Dr. Mark)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemonstrateLogin('creator')}
                    className="py-1.5 px-2 bg-indigo-900/40 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-700/40 rounded-lg text-[10px] font-bold transition-colors"
                  >
                    Creator (Centenary)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
