import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle } from 'lucide-react';

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const AuthCard = () => {
  const [authState, setAuthState] = useState('login'); // 'login', 'signup'
  const { login, register } = useAuth();
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('remember_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Clear password and errors on switching login/signup
  useEffect(() => {
    setPassword('');
    setErrorMessage('');
  }, [authState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanUsername = username ? username.trim() : '';
    
    // Validation
    if (authState === 'login') {
      if (!cleanEmail || !password) {
        setErrorMessage('Please enter your email and password.');
        setLoading(false);
        return;
      }
      if (!validateEmail(cleanEmail)) {
        setErrorMessage('Please enter a valid email address.');
        setLoading(false);
        return;
      }
    } else if (authState === 'signup') {
      if (!cleanUsername || !cleanEmail || !password) {
        setErrorMessage('Please fill in all details.');
        setLoading(false);
        return;
      }
      if (cleanUsername.length < 2) {
        setErrorMessage('Name must be at least 2 characters.');
        setLoading(false);
        return;
      }
      if (!validateEmail(cleanEmail)) {
        setErrorMessage('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
    }

    try {
      if (authState === 'login') {
        await login(cleanEmail, password);
        if (rememberMe) {
          localStorage.setItem('remember_email', cleanEmail);
        } else {
          localStorage.removeItem('remember_email');
        }
      } else if (authState === 'signup') {
        await register(cleanUsername, cleanEmail, password);
      }
      
      // Success screen transition
      setIsSuccess(true);
      setTimeout(() => {
        window.location.hash = '#/dashboard';
      }, 1500);
      
    } catch (err) {
      if (err.message === 'Account not found') {
        setErrorMessage('Account not found. Please double-check your email or click Sign Up below to create an account.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please verify your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const LotusLogo = () => (
    <div className="flex flex-col items-center justify-center mb-6 mt-2">
      <svg className="w-14 h-14 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="50" cy="45" r="22" strokeDasharray="3 3" opacity="0.3" />
        <path d="M50 78 C 50 78 22 52 22 39 C 22 25 32 17 50 39 C 68 17 78 25 78 39 C 78 52 50 78 50 78 Z" />
        <path d="M50 78 C 50 78 32 56 32 44 C 32 32 40 28 50 44 C 60 28 68 32 68 44 C 68 56 50 78 50 78 Z" />
        <path d="M25 78 C 38 82 62 82 75 78 Q 50 80 25 78" strokeWidth="2" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050a09] p-4 relative overflow-hidden">
      {/* Soft gradient glowing backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-950/15 blur-[120px] pointer-events-none"></div>
      
      {/* Simple, premium glass card container */}
      <div className="w-full max-w-[420px] bg-[#0e1614]/50 backdrop-blur-xl border border-white/10 rounded-[28px] p-8 md:p-10 shadow-2xl relative z-10 flex flex-col justify-center min-h-[520px] transition-all duration-300">
        
        {isSuccess ? (
          /* Success Screen */
          <div className="flex flex-col items-center justify-center text-center py-10 animate-scale-up">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-lg scale-125 animate-pulse"></div>
              <div className="w-16 h-16 rounded-full border-4 border-emerald-400 flex items-center justify-center bg-[#0e1614]/90 relative z-10">
                <CheckCircle className="text-emerald-400 w-10 h-10" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide uppercase">Access Granted</h2>
            <p className="text-emerald-400/80 text-[10px] mt-2 font-bold tracking-widest uppercase animate-pulse">
              Loading workspace...
            </p>
          </div>
        ) : (
          /* Auth Form Screen */
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <LotusLogo />

              {/* Header Title */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  {authState === 'login' ? 'Sign In' : 'Sign Up'}
                </h1>
                <p className="text-gray-400 text-xs mt-1.5 font-light">
                  {authState === 'login' 
                    ? 'Welcome back! Enter your details to continue.' 
                    : 'Create a new account to sync and save your works.'}
                </p>
              </div>

              {/* Error messages */}
              {errorMessage && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl leading-relaxed">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Sign-Up Name Input */}
                {authState === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-400/80 mb-2 uppercase tracking-wider pl-1">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none text-sm transition-all"
                        placeholder="Full Name"
                      />
                      <span className="absolute left-4 top-3 text-emerald-500/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </span>
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-[10px] font-bold text-emerald-400/80 mb-2 uppercase tracking-wider pl-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      className="w-full bg-white/5 border border-white/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none text-sm transition-all"
                      placeholder="user@mail.com"
                    />
                    <Mail className="absolute left-4 top-3 text-emerald-500/50" size={16} />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-[10px] font-bold text-emerald-400/80 mb-2 uppercase tracking-wider pl-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 rounded-xl pl-11 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none text-sm transition-all"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-4 top-3 text-emerald-500/50" size={16} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors p-0.5"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me / Forgot Password */}
                {authState === 'login' && (
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-white/10 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer bg-white/5"
                      />
                      <span>Remember Me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => alert('Password Recovery: Check your email for resetting steps.')} 
                      className="hover:underline font-medium text-emerald-400"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-[#0c1614] rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all duration-300 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.01] cursor-pointer mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-[#0c1614] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : authState === 'login' ? 'SIGN IN' : 'REGISTER NOW'}
                </button>
              </form>
            </div>

            {/* Switch authentication view link */}
            <div className="mt-8 text-center text-xs">
              <span className="text-gray-500 font-light">
                {authState === 'login' ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={() => setAuthState(authState === 'login' ? 'signup' : 'login')}
                className="text-emerald-400 font-bold hover:underline bg-transparent border-0 cursor-pointer ml-1"
              >
                {authState === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthCard;
