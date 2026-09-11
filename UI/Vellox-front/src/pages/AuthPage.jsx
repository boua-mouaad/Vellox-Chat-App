import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'verify'
  
  // Login State
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Verify State
  const [verifyEmailAddress, setVerifyEmailAddress] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Feedback State
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  const { login, register, verifyEmail } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      setError(decodeURIComponent(err));
    }
  }, [searchParams]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await login(identifier, loginPassword);
      navigate('/chat');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials or unverified account.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await register(regUsername, regEmail, regPassword);
      setVerifyEmailAddress(regEmail);
      setSuccessMsg(res.message || 'Registration successful! Please check your email for the verification code.');
      setActiveTab('verify');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Username or email may already be in use.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await verifyEmail(verifyEmailAddress, verificationCode);
      setSuccessMsg(res.message || 'Email verified successfully! You can now log in.');
      setIdentifier(regUsername || verifyEmailAddress);
      setActiveTab('login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired verification code.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#0B0F19] font-sans text-slate-300 overflow-hidden selection:bg-cyan-500/30 p-4">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-125 w-125 rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-150 w-150 rounded-full bg-purple-600/10 blur-[150px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-md rounded-2xl border border-slate-700/60 bg-[#131825]/90 p-8 shadow-2xl backdrop-blur-xl transition-all">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_15px_rgba(34,211,238,0.3)] text-white font-bold text-xl">
            {activeTab === 'verify' ? '✓' : 'V'}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-50">
            {activeTab === 'verify' 
              ? 'Verify your email' 
              : (activeTab === 'login' ? 'Welcome back to Vellox' : 'Create your Vellox account')}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {activeTab === 'verify'
              ? 'Enter the 6-digit code sent to your inbox'
              : (activeTab === 'login' ? 'Enter your credentials to access your chats' : 'Sign up to start chatting with friends and teams')}
          </p>
        </div>

        {/* Tab Switcher */}
        {activeTab !== 'verify' ? (
          <div className="mb-6 flex rounded-lg bg-[#06090F] p-1 border border-slate-800/60">
            <button 
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }} 
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${activeTab === 'login' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab('register'); setError(''); setSuccessMsg(''); }} 
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${activeTab === 'register' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Register
            </button>
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-between text-xs text-slate-400">
            <span>Already have verified code?</span>
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
              className="text-cyan-400 hover:underline font-medium"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center text-sm font-medium text-red-400">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center text-sm font-medium text-emerald-400">
            {successMsg}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Username or Email</label>
              <input 
                type="text" 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)} 
                required 
                placeholder="username or user@example.com" 
                className="w-full rounded-lg border border-slate-700/50 bg-[#06090F] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30" 
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
              <input 
                type="password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                required 
                placeholder="••••••••" 
                className="w-full rounded-lg border border-slate-700/50 bg-[#06090F] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !identifier || !loginPassword} 
              className="mt-2 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => { setActiveTab('verify'); setError(''); setSuccessMsg(''); }}
                className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
              >
                Have a verification code? Verify your account
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Username</label>
              <input 
                type="text" 
                value={regUsername} 
                onChange={(e) => setRegUsername(e.target.value)} 
                required 
                placeholder="Pick a unique username" 
                className="w-full rounded-lg border border-slate-700/50 bg-[#06090F] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30" 
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Email address</label>
              <input 
                type="email" 
                value={regEmail} 
                onChange={(e) => setRegEmail(e.target.value)} 
                required 
                placeholder="you@example.com" 
                className="w-full rounded-lg border border-slate-700/50 bg-[#06090F] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30" 
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
              <input 
                type="password" 
                value={regPassword} 
                onChange={(e) => setRegPassword(e.target.value)} 
                required 
                placeholder="At least 6 characters" 
                className="w-full rounded-lg border border-slate-700/50 bg-[#06090F] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !regUsername || !regEmail || !regPassword} 
              className="mt-2 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Verification Form */}
        {activeTab === 'verify' && (
          <form className="space-y-4" onSubmit={handleVerifySubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Email address</label>
              <input 
                type="email" 
                value={verifyEmailAddress} 
                onChange={(e) => setVerifyEmailAddress(e.target.value)} 
                required 
                placeholder="you@example.com" 
                className="w-full rounded-lg border border-slate-700/50 bg-[#06090F] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30" 
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">6-Digit Verification Code</label>
              <input 
                type="text" 
                maxLength={6}
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value.trim())} 
                required 
                placeholder="123456" 
                className="w-full text-center tracking-[0.4em] font-mono text-lg rounded-lg border border-slate-700/50 bg-[#06090F] px-4 py-2.5 text-cyan-400 placeholder-slate-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !verifyEmailAddress || verificationCode.length < 6} 
              className="mt-2 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Email & Proceed to Login'}
            </button>
          </form>
        )}

        {/* OAuth2 Divider & Social Login Buttons */}
        {activeTab !== 'verify' && (
          <div className="mt-6 border-t border-slate-800/80 pt-6">
            <div className="relative mb-4 flex items-center justify-center">
              <span className="bg-[#131825] px-2 text-xs uppercase tracking-wider text-slate-500">Or continue with</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="http://localhost:8100/oauth2/authorization/google"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-700/60 bg-[#06090F]/70 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
                </svg>
                Google
              </a>
              <a
                href="http://localhost:8100/oauth2/authorization/github"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-700/60 bg-[#06090F]/70 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}