import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Image, Presentation, FileText, Trash2, Calendar, ArrowRight, Play } from 'lucide-react';

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
          fetch('http://localhost:5000/api/photos', { headers }),
          fetch('http://localhost:5000/api/ppt', { headers }),
          fetch('http://localhost:5000/api/resumes', { headers })
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
      const response = await fetch(`http://localhost:5000/api/${type}/${id}`, {
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
    <div className="space-y-8 animate-float-in">
      
      {/* Premium Nature Welcome Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#1e3f35] p-8 md:p-12 border border-white/5 shadow-glass">
        {/* Leaf details */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000" 
            alt="Leaf Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-400/10 blur-[100px]" />
        
        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full tracking-wider uppercase mb-4">
            🌿 Creative Sandbox Dashboard
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight font-sans mb-4">
            Welcome back, <span className="text-emerald-300">{user?.username || 'Jane'}</span>!
          </h1>
          <p className="text-emerald-100/80 font-light text-base md:text-lg mb-6">
            Your premium creative space is synchronized. Upload and enhance photos, draft AI slides, and craft professional resumes seamlessly.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveTab('photos')}
              className="px-6 py-3 bg-emerald-500 text-[#0d1d19] hover:bg-emerald-400 transition-all font-semibold rounded-2xl flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Image size={18} />
              <span>Launch Photo Suite</span>
            </button>
            <button 
              onClick={() => setActiveTab('ppt')}
              className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all font-semibold rounded-2xl flex items-center gap-2 cursor-pointer"
            >
              <Presentation size={18} />
              <span>Create AI PPT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Module Overview Cards Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 font-sans flex items-center gap-2">
          <span>🚀</span> Quick Launch Suite
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Photo */}
          <div 
            onClick={() => setActiveTab('photos')}
            className="glass-card rounded-[24px] p-6 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Image size={24} />
              </div>
              <h3 className="text-lg font-bold text-white font-sans group-hover:text-emerald-300 transition-colors">Photo Suite</h3>
              <p className="text-gray-400 text-sm font-light mt-2 leading-relaxed">
                Upload JPEG/PNG files to resize, crop, rotate, adjust filters, and apply mock AI exposure enhancements instantly.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-6 self-start">
              <span>Start Editing</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: AI PPT */}
          <div 
            onClick={() => setActiveTab('ppt')}
            className="glass-card rounded-[24px] p-6 cursor-pointer flex flex-col justify-between group"
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
          </div>

          {/* Card 3: Resume */}
          <div 
            onClick={() => setActiveTab('resume')}
            className="glass-card rounded-[24px] p-6 cursor-pointer flex flex-col justify-between group"
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
          </div>
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
                            src={p.editedUrl.startsWith('/uploads/') ? `http://localhost:5000${p.editedUrl}` : p.editedUrl} 
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
