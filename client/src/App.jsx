import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AuthCard from './components/AuthCard';
import Dashboard from './components/Dashboard';
import PhotoSuite from './pages/PhotoSuite';
import AIPresentation from './pages/AIPresentation';
import ResumeBuilder from './pages/ResumeBuilder';
import Profile from './pages/Profile';

const getTabFromHash = (hash) => {
  const clean = hash.replace(/^#\/?/, '');
  const validTabs = ['dashboard', 'photos', 'ppt', 'resume', 'profile'];
  return validTabs.includes(clean) ? clean : 'dashboard';
};

const MainLayout = () => {
  const { isAuthenticated, isLoading, theme } = useAuth();
  const [activeTab, setActiveTab] = useState(() => getTabFromHash(window.location.hash));
  const [loadedProject, setLoadedProject] = useState(null);

  // Sync hash changes back to state (e.g. for back/forward browser buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash(window.location.hash);
      setActiveTab(tab);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Ensure we have a valid hash on load
    if (isAuthenticated) {
      if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = '#/dashboard';
      } else {
        handleHashChange();
      }
    } else {
      // If NOT authenticated, clear the hash or set it to empty/auth
      if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '#/') {
        window.location.hash = '';
      }
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  // Wrap navigation to update URL hash instead of local state directly
  const navigateToTab = (tabName) => {
    window.location.hash = `#/${tabName}`;
  };

  // Transition to edit tab and stage the project data
  const handleLoadProject = (tabName, projectData) => {
    setLoadedProject(projectData);
    navigateToTab(tabName);
  };

  const handleClearLoadedProject = () => {
    setLoadedProject(null);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 ${
        theme === 'forest' ? 'bg-[#0d1d19]' : 'bg-[#020617]'
      }`}>
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-emerald-400 font-medium text-xs tracking-wider uppercase mt-4 animate-pulse">
          Synchronizing Workspace...
        </span>
      </div>
    );
  }

  // Guest Redirect: If not authenticated, render the gorgeous Leaf Sign-in/Sign-up overlay cards!
  if (!isAuthenticated) {
    return <AuthCard />;
  }

  // Active theme background styles
  const getAppBgClass = () => {
    return theme === 'forest' 
      ? 'bg-[#0d1d19] text-slate-100' 
      : 'bg-[#020617] text-slate-100';
  };

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row transition-colors duration-500 overflow-hidden relative ${getAppBgClass()}`}>
      
      {/* 1. Premium Glassmorphic Leaf Sidebar & Floating Bottom Nav */}
      <Sidebar activeTab={activeTab} setActiveTab={navigateToTab} />
      
      {/* 2. Main Page Stage */}
      {/* Note: added pb-24 for mobile screens so that the bottom navigation bar doesn't overlap contents! */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 relative z-10">
        
        {/* Glowing glass overlay decorations */}
        {theme === 'forest' ? (
          <>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-forest-800/5 blur-[120px] pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-800/5 blur-[120px] pointer-events-none" />
          </>
        )}

        <div className="max-w-7xl mx-auto pb-12 relative z-10">
          
          {/* TAB 1: Dashboard */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              setActiveTab={navigateToTab} 
              loadProject={handleLoadProject} 
            />
          )}

          {/* TAB 2: Photo Suite */}
          {activeTab === 'photos' && (
            <PhotoSuite 
              projectToLoad={loadedProject} 
              clearLoadedProject={handleClearLoadedProject} 
            />
          )}

          {/* TAB 3: AI PPT Section */}
          {activeTab === 'ppt' && (
            <AIPresentation 
              projectToLoad={loadedProject} 
              clearLoadedProject={handleClearLoadedProject} 
            />
          )}

          {/* TAB 4: Resume Builder */}
          {activeTab === 'resume' && (
            <ResumeBuilder 
              projectToLoad={loadedProject} 
              clearLoadedProject={handleClearLoadedProject} 
            />
          )}

          {/* TAB 5: User Profile */}
          {activeTab === 'profile' && (
            <Profile 
              setActiveTab={navigateToTab}
              loadProject={handleLoadProject}
            />
          )}

        </div>
      </main>

    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
