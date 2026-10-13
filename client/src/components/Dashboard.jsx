import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Image, Presentation, FileText, Trash2, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { API_BASE } from '../config/api';

export const Dashboard = ({ setActiveTab, loadProject }) => {
  const { user, token } = useAuth();
  
  // Dashboard Project States
  const [photoProjects, setPhotoProjects] = useState([]);
  const [pptProjects, setPptProjects] = useState([]);
  const [resumeProjects, setResumeProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all projects concurrently on mount
  useEffect(() => {
    const fetchAllProjects = async () => {
      setLoading(true);
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
        console.warn('⚠️ Server offline during dashboard load. Activating client mock projects caching.');
        
        // Mock data fallback so the user always has a beautifully populated dashboard to try out!
        setPhotoProjects([
          { _id: 'mock_p1', name: 'Autumn Foliage', originalUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300', editedUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300', createdAt: new Date().toISOString() }
        ]);
        setPptProjects([
          { _id: 'mock_ppt1', name: 'Coffee Shop Pitch', prompt: 'A marketing strategy for a coffee shop', style: 'Minimalist', slides: [], createdAt: new Date().toISOString() }
        ]);
        setResumeProjects([
          { _id: 'mock_res1', name: 'Jane Doe Tech CV', templateId: 'modern', createdAt: new Date().toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAllProjects();
    }
  }, [token]);

  // Project Delete Handlers
  const handleDelete = async (type, id, e) => {
    e.stopPropagation(); // Avoid triggering open card click
    
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
      // Mock Fallback Deletions
      if (type === 'photos') setPhotoProjects(prev => prev.filter(p => p._id !== id));
      if (type === 'ppt') setPptProjects(prev => prev.filter(p => p._id !== id));
      if (type === 'resumes') setResumeProjects(prev => prev.filter(p => p._id !== id));
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

  return (
    <div className="workspace-page space-y-8 animate-float-in">
      
      {/* Premium Nature Welcome Banner */}
      <div className="dashboard-hero relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#173c30] via-[#10291f] to-[#0a1713] p-6 sm:p-8 md:p-12 border border-emerald-100/10 shadow-[0_28px_80px_rgba(0,0,0,.28)]">
        {/* Leaf details */}
        <div className="absolute inset-0 opacity-[0.13] pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000" 
            alt="Leaf Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-400/10 blur-[100px]" />
        
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-300/10 text-emerald-200 text-[11px] font-semibold rounded-full tracking-[.14em] uppercase mb-5 border border-emerald-200/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#86efac]" /> Your creative workspace
          </span>
          <h1 className="text-[2.15rem] leading-[1.08] sm:text-4xl md:text-[3.5rem] font-semibold text-white tracking-[-.04em] font-sans mb-4">
            Welcome back, <span className="text-emerald-300">{user?.username || 'Jane'}</span>!
          </h1>
          <p className="text-emerald-50/70 leading-relaxed text-sm sm:text-base md:text-lg mb-7 max-w-lg">
            One calm, focused place to edit imagery, shape a presentation, and build a resume you’re proud to share.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveTab('photos')}
              className="px-5 py-3 bg-[#b5efc9] text-[#0d1d19] hover:bg-white transition-all font-semibold rounded-2xl flex items-center gap-2 cursor-pointer shadow-[0_8px_25px_rgba(125,220,160,.18)]"
            >
              <Image size={18} />
              <span>Launch Photo Suite</span>
            </button>
            <button 
              onClick={() => setActiveTab('ppt')}
              className="px-5 py-3 bg-white/[.07] hover:bg-white/[.12] border border-white/15 text-white transition-all font-semibold rounded-2xl flex items-center gap-2 cursor-pointer"
            >
              <Presentation size={18} />
              <span>Create AI PPT</span>
            </button>
          </div>
        </div>
        <div className="hidden xl:block absolute right-10 top-1/2 -translate-y-1/2 w-[310px] h-[270px]" aria-hidden="true">
          <div className="absolute right-0 top-2 w-[215px] h-[240px] rounded-[28px] rotate-[7deg] bg-gradient-to-br from-[#d9f4df] to-[#8fc5a0] p-3 shadow-2xl shadow-black/30">
            <div className="h-full rounded-[19px] bg-[#13281e] overflow-hidden p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-[.18em] text-emerald-200/70">Studio / 01</span><Sparkles size={15} className="text-emerald-200" /></div>
              <div className="space-y-2"><div className="h-2 w-20 rounded-full bg-emerald-200/30" /><div className="text-2xl font-semibold leading-tight text-white">Make room<br />for ideas.</div></div>
              <div className="rounded-xl border border-white/10 bg-white/[.06] p-3"><div className="flex gap-2"><div className="h-8 w-8 rounded-lg bg-emerald-300/20 flex items-center justify-center"><Image size={15} className="text-emerald-200" /></div><div><div className="h-2 w-16 rounded bg-white/30 mt-1"/><div className="h-1.5 w-11 rounded bg-white/15 mt-2"/></div></div></div>
            </div>
          </div>
          <div className="absolute left-0 bottom-5 rounded-2xl border border-white/15 bg-[#f6f4e9] text-slate-900 p-4 shadow-xl shadow-black/25 -rotate-[5deg]">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center"><Presentation size={16}/></div><div><div className="text-[10px] text-slate-500">CREATIVE SUITE</div><div className="font-semibold text-sm">Ideas, in motion</div></div></div>
          </div>
          <div className="absolute right-2 -bottom-1 rounded-full border border-emerald-100/20 bg-[#1b4c39] px-3 py-2 text-xs font-medium text-emerald-50 shadow-lg flex items-center gap-2"><FileText size={14}/> Ready when you are</div>
        </div>
      </div>

      {/* Module Overview Cards Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 font-sans flex items-center gap-2">
          <span>🚀</span> Quick Launch Suite
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Photo */}
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className="glass-card rounded-[24px] p-6 cursor-pointer flex flex-col justify-between group text-left"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Image size={24} />
              </div>
              <h3 className="text-lg font-bold text-white font-sans group-hover:text-emerald-300 transition-colors">Photo Suite</h3>
              <p className="text-gray-400 text-sm font-light mt-2 leading-relaxed">
                Upload a photo to resize, rotate, refine color, and export a clean, high-quality image.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-6 self-start">
              <span>Start Editing</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: AI PPT */}
          <button
            type="button"
            onClick={() => setActiveTab('ppt')}
            className="glass-card rounded-[24px] p-6 cursor-pointer flex flex-col justify-between group text-left"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <Presentation size={24} />
              </div>
              <h3 className="text-lg font-bold text-white font-sans group-hover:text-blue-300 transition-colors">AI Presentation</h3>
              <p className="text-gray-400 text-sm font-light mt-2 leading-relaxed">
                Generate professional PowerPoint slides in seconds from natural text prompts. Includes theme selections and edits.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mt-6 self-start">
              <span>Generate PPT</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: Resume */}
          <button
            type="button"
            onClick={() => setActiveTab('resume')}
            className="glass-card rounded-[24px] p-6 cursor-pointer flex flex-col justify-between group text-left"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-bold text-white font-sans group-hover:text-purple-300 transition-colors">Resume Builder</h3>
              <p className="text-gray-400 text-sm font-light mt-2 leading-relaxed">
                Build high-fidelity professional CVs in real-time. Choose between Modern, Academic, and Minimalist structures.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold mt-6 self-start">
              <span>Build Profile</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Recent Projects List Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 font-sans flex items-center gap-2">
          <span>📂</span> Recent Active Projects
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {photoProjects.length === 0 && pptProjects.length === 0 && resumeProjects.length === 0 ? (
              <div className="glass-card rounded-[24px] p-12 text-center text-gray-400">
                <p className="text-base font-light">No projects found. Launch one of the tools above to create your first design project!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Photo Projects */}
                {photoProjects.map(p => (
                  <div 
                    key={p._id} 
                    onClick={() => loadProject('photos', p)}
                    className="glass-card rounded-[20px] p-4 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-white/5 flex items-center justify-center shrink-0">
                        {p.editedUrl ? (
                          <img 
                            src={p.editedUrl.startsWith('/uploads/') ? `${API_BASE}${p.editedUrl}` : p.editedUrl} 
                            alt={p.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <Image size={24} className="text-emerald-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="inline-block text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-semibold mb-1">
                          PHOTO
                        </span>
                        <h4 className="font-bold text-sm text-white truncate group-hover:text-emerald-300 transition-colors">
                          {p.name}
                        </h4>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={10} /> {formatDate(p.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => handleDelete('photos', p._id, e)}
                      className="w-9 h-9 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {/* PPT Projects */}
                {pptProjects.map(p => (
                  <div 
                    key={p._id} 
                    onClick={() => loadProject('ppt', p)}
                    className="glass-card rounded-[20px] p-4 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                        <Presentation size={24} />
                      </div>
                      <div className="min-w-0">
                        <span className="inline-block text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md font-semibold mb-1">
                          AI PPT
                        </span>
                        <h4 className="font-bold text-sm text-white truncate group-hover:text-blue-300 transition-colors">
                          {p.name}
                        </h4>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={10} /> {formatDate(p.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => handleDelete('ppt', p._id, e)}
                      className="w-9 h-9 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {/* Resume Projects */}
                {resumeProjects.map(p => (
                  <div 
                    key={p._id} 
                    onClick={() => loadProject('resume', p)}
                    className="glass-card rounded-[20px] p-4 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                        <FileText size={24} />
                      </div>
                      <div className="min-w-0">
                        <span className="inline-block text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-md font-semibold mb-1">
                          RESUME
                        </span>
                        <h4 className="font-bold text-sm text-white truncate group-hover:text-purple-300 transition-colors">
                          {p.name}
                        </h4>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={10} /> {formatDate(p.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => handleDelete('resumes', p._id, e)}
                      className="w-9 h-9 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
