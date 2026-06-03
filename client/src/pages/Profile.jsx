import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Key,
  LogOut,
  FolderOpen,
  Image as ImageIcon,
  Presentation,
  FileText,
  Calendar,
  Trash2,
  Save,
  Lock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Download,
  Sparkles
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const Profile = ({ setActiveTab, loadProject }) => {
  const { user, token, logout, updateProfile, theme } = useAuth();

  // Profile fields state
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state feedback
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // PWA Install States
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already installed or in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('🍃 PWA installation approved!');
    }
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  // Work portfolio state
  const [photoProjects, setPhotoProjects] = useState([]);
  const [pptProjects, setPptProjects] = useState([]);
  const [resumeProjects, setResumeProjects] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  // Fetch all user saved works
  const fetchAllProjects = async () => {
    setPortfolioLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [photosRes, pptRes, resumesRes] = await Promise.all([
        fetch(`${API_BASE}/api/photos`, { headers }),
        fetch(`${API_BASE}/api/ppt`, { headers }),
        fetch(`${API_BASE}/api/resumes`, { headers })
      ]);

      if (photosRes.ok) {
        const photos = await photosRes.json();
        setPhotoProjects(photos);
      }
      if (pptRes.ok) {
        const ppts = await pptRes.json();
        setPptProjects(ppts);
      }
      if (resumesRes.ok) {
        const resumes = await resumesRes.json();
        setResumeProjects(resumes);
      }
    } catch (err) {
      console.warn('⚠️ Server offline during profile dashboard load.');
    } finally {
      setPortfolioLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllProjects();
    }
  }, [token]);

  // Project Delete Handlers
  const handleDelete = async (type, id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this project?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        if (type === 'photos') setPhotoProjects(prev => prev.filter(p => p._id !== id));
        if (type === 'ppt') setPptProjects(prev => prev.filter(p => p._id !== id));
        if (type === 'resumes') setResumeProjects(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit profile changes
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const cleanUsername = username ? username.trim() : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    if (!cleanUsername || !cleanEmail) {
      setErrorMsg('Name and email are required.');
      setLoading(false);
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await updateProfile(cleanUsername, cleanEmail, password || undefined);
      setSuccessMsg('Your profile has been successfully updated.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Unable to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Recent';
    }
  };

  const getThemeAccentClass = () => {
    return theme === 'forest' ? 'bg-[#3d685a] hover:bg-[#1e3f35]' : 'bg-[#2563eb] hover:bg-[#1d4ed8]';
  };

  return (
    <div className="space-y-8 animate-float-in">

      {/* Profile Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-sans flex items-center gap-2">
            <span>👤</span> Account Profile
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Manage your credentials, view your compiled works, and configure your session.
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          <LogOut size={14} />
          <span>Log Out Session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Update Profile Form & Metadata */}
        <div className="lg:col-span-5 space-y-6">

          {/* User Details card */}
          <div className="glass-card rounded-[32px] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] rounded-full bg-emerald-500/5 blur-[60px]" />

            <div className="flex items-center gap-4 border-b border-white/5 pb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-400 uppercase">
                    {user?.username?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-sans">{user?.username}</h2>
                <p className="text-xs text-gray-500 font-light mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3.5 text-xs text-gray-400 font-light">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500 uppercase text-[9px] tracking-wider">Account Level</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 font-bold rounded">Premium Tier</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500 uppercase text-[9px] tracking-wider">Theme Mode</span>
                <span className="font-medium text-white capitalize">{theme} Theme</span>
              </div>
              {user?.createdAt && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500 uppercase text-[9px] tracking-wider">Member Since</span>
                  <span className="font-medium text-white">{formatDate(user.createdAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* PWA Mobile App Installer Card */}
          <div className="glass-card rounded-[32px] p-6 relative overflow-hidden border border-[#8ca69e]/10 shadow-glass animate-fade-in">
            <div className="absolute top-0 right-0 w-[120px] h-[120px] rounded-full bg-emerald-500/5 blur-[50px]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3.5 flex items-center gap-3">
              <img src="/icon.png" alt="ALL IN ONE App Logo" className="w-8 h-8 rounded-lg shadow-md border border-white/10 shrink-0" />
              <span>ALL IN ONE MOBILE APP</span>
            </h3>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Install this creative sandbox directly onto your phone or laptop. Works offline, launches instantly from your home screen as a standalone app, and unlocks a full-screen experience!
            </p>

            {showInstallBtn ? (
              <button
                onClick={handleInstallApp}
                className="w-full mt-4 py-3 bg-[#8ca69e] hover:bg-[#9cb6ae] text-[#162320] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Download size={14} />
                <span>Download standalone app</span>
              </button>
            ) : (
              <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-emerald-300/80 font-light">
                {window.matchMedia('(display-mode: standalone)').matches ? (
                  <div className="flex items-center gap-1.5 font-medium text-emerald-400">
                    <Sparkles size={12} className="text-yellow-400" />
                    <span>Standalone app active!</span>
                  </div>
                ) : (
                  <div>
                    <span className="font-semibold block mb-0.5 text-white">How to Download:</span>
                    <span className="block text-gray-400 text-[10px]">
                      • **Android/Chrome**: Tap the browser menu and select **"Install App"**.
                    </span>
                    <span className="block text-gray-400 text-[10px] mt-0.5">
                      • **iOS/Safari**: Tap the share button <span className="text-[#8ca69e] font-semibold">"Share"</span> and select **"Add to Home Screen"**.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form container */}
          <div className="glass-card rounded-[32px] p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Lock size={14} className="text-emerald-400" />
              <span>Update Credentials</span>
            </h3>

            {successMsg && (
              <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold mb-1.5 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-emerald-700/60" size={16} />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-semibold mb-1.5 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-emerald-700/60" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-semibold mb-1.5 uppercase">New Password (Optional)</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-emerald-700/60" size={16} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[9px] text-gray-500 mt-1">Leave empty to keep your existing password.</p>
              </div>

              {password && (
                <div className="animate-slide-down">
                  <label className="block text-[10px] text-gray-500 font-semibold mb-1.5 uppercase">Verify Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 text-emerald-700/60" size={16} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${getThemeAccentClass()}`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : <Save size={14} />}
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Aggregated Portfolio / Work Dashboard */}
        <div className="lg:col-span-7 space-y-6">

          <div className="glass-card rounded-[32px] p-6 relative overflow-hidden">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <FolderOpen size={16} className="text-emerald-400" />
              <span>My Compiled Portfolio</span>
            </h3>

            {portfolioLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {photoProjects.length === 0 && pptProjects.length === 0 && resumeProjects.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 border border-white/5 rounded-2xl bg-slate-900/20">
                    <p className="text-sm font-light">No saved workspace files found in your account.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[580px] overflow-y-auto pr-1">

                    {/* Photos */}
                    {photoProjects.map(p => (
                      <div
                        key={p._id}
                        onClick={() => loadProject('photos', p)}
                        className="p-4 bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-emerald-500/20 rounded-2xl flex items-center justify-between cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-white/5 flex items-center justify-center shrink-0">
                            {p.editedUrl ? (
                              <img
                                src={p.editedUrl.startsWith('/uploads/') ? `${API_BASE}${p.editedUrl}` : p.editedUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon size={20} className="text-emerald-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="inline-block text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-semibold mb-0.5">
                              PHOTO
                            </span>
                            <h4 className="font-bold text-xs text-white truncate group-hover:text-emerald-300 transition-colors">
                              {p.name}
                            </h4>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Calendar size={8} /> {formatDate(p.createdAt)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDelete('photos', p._id, e)}
                          className="w-8 h-8 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}

                    {/* AI Presentation PPT */}
                    {pptProjects.map(p => (
                      <div
                        key={p._id}
                        onClick={() => loadProject('ppt', p)}
                        className="p-4 bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-blue-500/20 rounded-2xl flex items-center justify-between cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                            <Presentation size={20} />
                          </div>
                          <div className="min-w-0">
                            <span className="inline-block text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md font-semibold mb-0.5">
                              AI PPT
                            </span>
                            <h4 className="font-bold text-xs text-white truncate group-hover:text-blue-300 transition-colors">
                              {p.name}
                            </h4>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Calendar size={8} /> {formatDate(p.createdAt)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDelete('ppt', p._id, e)}
                          className="w-8 h-8 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}

                    {/* Resumes */}
                    {resumeProjects.map(p => (
                      <div
                        key={p._id}
                        onClick={() => loadProject('resume', p)}
                        className="p-4 bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-purple-500/20 rounded-2xl flex items-center justify-between cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0">
                            <span className="inline-block text-[9px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-md font-semibold mb-0.5">
                              RESUME
                            </span>
                            <h4 className="font-bold text-xs text-white truncate group-hover:text-purple-300 transition-colors">
                              {p.name}
                            </h4>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Calendar size={8} /> {formatDate(p.createdAt)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDelete('resumes', p._id, e)}
                          className="w-8 h-8 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}

                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
