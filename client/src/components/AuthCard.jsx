import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const AuthCard = () => {
  const [authState, setAuthState] = useState('welcome'); // 'welcome', 'login', 'signup'
  const { login, register } = useAuth();
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      if (authState === 'login') {
        if (!email || !password) {
          setErrorMessage('Please enter both your email and password.');
          setLoading(false);
          return;
        }
        await login(email, password);
      } else if (authState === 'signup') {
        if (!username || !email || !password) {
          setErrorMessage('Please fill in all the required details.');
          setLoading(false);
          return;
        }
        await register(username, email, password);
      }
      // Successful Login/Signup - land on the Dashboard!
      window.location.hash = '#/dashboard';
    } catch (err) {
      if (err.message === 'Account not found') {
        setErrorMessage('You do not have an account. Redirecting you to the Sign Up page...');
        setTimeout(() => {
          setAuthState('signup');
          setErrorMessage('');
        }, 2000);
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please verify your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const LotusLogo = () => (
    <div className="flex flex-col items-center justify-center mb-6 mt-2">
      <svg className="w-16 h-16 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
        {/* Sun / Aura */}
        <circle cx="50" cy="45" r="22" strokeDasharray="3 3" opacity="0.4" />
        {/* Lotus Petals */}
        <path d="M50 78 C 50 78 22 52 22 39 C 22 25 32 17 50 39 C 68 17 78 25 78 39 C 78 52 50 78 50 78 Z" />
        <path d="M50 78 C 50 78 32 56 32 44 C 32 32 40 28 50 44 C 60 28 68 32 68 44 C 68 56 50 78 50 78 Z" />
        {/* Center Bud */}
        <path d="M50 78 C 50 78 42 61 42 51 C 42 41 46 38 50 51 C 54 38 58 41 58 51 C 58 61 50 78 50 78 Z" fill="currentColor" fillOpacity="0.2" />
        {/* Base Lotus platform */}
        <path d="M25 78 C 38 82 62 82 75 78 Q 50 80 25 78" strokeWidth="2" />
        <circle cx="50" cy="79" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b1412] p-4 relative overflow-hidden">
      {/* Background glowing starry space/forest decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/20 blur-[130px] animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-950/20 blur-[130px] animate-pulse-glow"></div>
      
      {/* Subtle organic leaves background overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] z-0" />
      
      {/* Main card grid showcasing the responsive vertical card from Image 2 */}
      <div className="w-full max-w-[420px] bg-[#162320]/90 backdrop-blur-2xl border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl relative z-20 flex flex-col justify-center min-h-[560px] overflow-hidden">
        
        {/* Bottom leaf illustration vector line overlays mimicking the reference design */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none opacity-[0.06] overflow-hidden z-0">
          <svg className="w-full h-full text-emerald-400" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M0,20 Q10,10 20,20 Q30,12 40,20 Q50,8 60,20 Q70,14 80,20 Q90,10 100,20" />
            <path d="M5,20 C15,15 25,12 35,20 M45,20 C55,16 65,14 75,20" />
          </svg>
        </div>

        {/* -------------------- STAGE 1: WELCOME SCREEN -------------------- */}
        {authState === 'welcome' && (
          <div className="flex flex-col h-full justify-between relative z-10 text-center animate-fade-in">
            <div>
              <LotusLogo />
              <h1 className="text-3xl font-extrabold text-white tracking-[0.2em] font-sans uppercase">
                WELCOME
              </h1>
              <p className="text-gray-400 text-xs mt-3 leading-relaxed max-w-[280px] mx-auto font-light">
                Do creative work. Stay focused.<br />Live a productive life.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              <button
                onClick={() => setAuthState('login')}
                className="w-full py-4.5 bg-[#8ca69e] hover:bg-[#9cb6ae] text-[#162320] rounded-[16px] font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-md cursor-pointer hover:scale-[1.01]"
              >
                Login With Email
              </button>

              <div className="text-center text-xs pt-2">
                <span className="text-gray-500 font-light">Don't have an account? </span>
                <button
                  onClick={() => setAuthState('signup')}
                  className="text-emerald-400/80 hover:text-emerald-400 font-semibold hover:underline bg-transparent border-0 cursor-pointer transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- STAGE 2: SIGN IN SCREEN -------------------- */}
        {authState === 'login' && (
          <div className="relative z-10 animate-fade-in">
            {/* Clean Back chevron button at top left (No overlaps!) */}
            <button 
              type="button" 
              onClick={() => { setAuthState('welcome'); setErrorMessage(''); }} 
              className="absolute -top-2 -left-2 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer border border-white/5"
              title="Back to Welcome"
            >
              <ArrowLeft size={16} />
            </button>

            <LotusLogo />

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Sign In
              </h2>
              <p className="text-gray-400 text-xs mt-1.5 font-light max-w-[260px] mx-auto leading-relaxed">
                Sign in now to access your workspace and saved projects.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl leading-relaxed">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field with Thin Border Line */}
              <div>
                <label className="block text-[10px] font-semibold text-emerald-400/80 mb-1 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-600 focus:border-emerald-400 py-2.5 text-white placeholder-gray-600 focus:outline-none text-sm transition-colors"
                  placeholder="user@mail.com"
                />
              </div>

              {/* Password Field with Thin Border Line */}
              <div>
                <label className="block text-[10px] font-semibold text-emerald-400/80 mb-1 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-600 focus:border-emerald-400 py-2.5 pr-10 text-white placeholder-gray-600 focus:outline-none text-sm transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-3 text-gray-500 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me / Forgot Password */}
              <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer bg-transparent"
                  />
                  <span className="text-gray-400 font-light">Remember Me</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => alert('Password Recovery: Secure instructions sent!')} 
                  className="hover:underline font-semibold text-emerald-400/90 bg-transparent border-0 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4.5 bg-[#8ca69e] hover:bg-[#9cb6ae] text-[#162320] rounded-[16px] font-extrabold text-xs tracking-wider uppercase transition-all duration-200 shadow-md cursor-pointer mt-4 hover:scale-[1.01]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#162320] border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  'LOGIN'
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs">
              <span className="text-gray-500 font-light">Don't have an account? </span>
              <button
                onClick={() => { setAuthState('signup'); setErrorMessage(''); }}
                className="text-emerald-400/90 font-bold hover:underline bg-transparent border-0 cursor-pointer ml-1"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* -------------------- STAGE 3: SIGN UP SCREEN -------------------- */}
        {authState === 'signup' && (
          <div className="relative z-10 animate-fade-in">
            {/* Clean Back chevron button at top left */}
            <button 
              type="button" 
              onClick={() => { setAuthState('welcome'); setErrorMessage(''); }} 
              className="absolute -top-2 -left-2 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer border border-white/5"
              title="Back to Welcome"
            >
              <ArrowLeft size={16} />
            </button>

            <LotusLogo />

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Sign Up
              </h2>
              <p className="text-gray-400 text-xs mt-1.5 font-light max-w-[260px] mx-auto leading-relaxed">
                Sign up now for free and start building your templates.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl leading-relaxed">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Field with Thin Border Line */}
              <div>
                <label className="block text-[10px] font-semibold text-emerald-400/80 mb-1 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-600 focus:border-emerald-400 py-2.5 text-white placeholder-gray-600 focus:outline-none text-sm transition-colors"
                  placeholder="Full Name"
                />
              </div>

              {/* Email Field with Thin Border Line */}
              <div>
                <label className="block text-[10px] font-semibold text-emerald-400/80 mb-1 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-600 focus:border-emerald-400 py-2.5 text-white placeholder-gray-600 focus:outline-none text-sm transition-colors"
                  placeholder="user@mail.com"
                />
              </div>

              {/* Password Field with Thin Border Line */}
              <div>
                <label className="block text-[10px] font-semibold text-emerald-400/80 mb-1 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-600 focus:border-emerald-400 py-2.5 pr-10 text-white placeholder-gray-600 focus:outline-none text-sm transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-3 text-gray-500 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4.5 bg-[#8ca69e] hover:bg-[#9cb6ae] text-[#162320] rounded-[16px] font-extrabold text-xs tracking-wider uppercase transition-all duration-200 shadow-md cursor-pointer mt-4 hover:scale-[1.01]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#162320] border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  'SIGNUP'
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs">
              <span className="text-gray-500 font-light">Already have an account? </span>
              <button
                onClick={() => { setAuthState('login'); setErrorMessage(''); }}
                className="text-emerald-400/90 font-bold hover:underline bg-transparent border-0 cursor-pointer ml-1"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthCard;
