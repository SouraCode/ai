import { lazy, Suspense, useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AuthCard from './components/AuthCard';
import Dashboard from './components/Dashboard';
const PhotoSuite = lazy(() => import('./pages/PhotoSuite'));
const AIPresentation = lazy(() => import('./pages/AIPresentation'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const Profile = lazy(() => import('./pages/Profile'));

const getTabFromHash = (hash) => {
  const clean = hash.replace(/^#\/?/, '');
  const validTabs = ['dashboard', 'photos', 'ppt', 'resume', 'profile'];
  return validTabs.includes(clean) ? clean : 'dashboard';
};

const MainLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 bg-[#E0E5EC]">
        <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[#6C63FF] font-medium text-xs tracking-wider uppercase mt-4 animate-pulse">
          Synchronizing Workspace...
        </span>
      </div>
    );
  }

  // Guest Redirect: If not authenticated, render the gorgeous Leaf Sign-in/Sign-up overlay cards!
  if (!isAuthenticated) {
    return <AuthCard />;
  }

  return (
    <div data-theme="soft-ui" className="min-h-screen w-full min-w-0 flex flex-col xl:flex-row transition-colors duration-500 overflow-x-hidden relative bg-[#E0E5EC] text-[#3D4852]">
      
      {/* Pill navigation stays labeled on desktop and becomes a compact menu on mobile. */}
      <Sidebar activeTab={activeTab} setActiveTab={navigateToTab} />
      
      {/* 2. Main Page Stage */}
      <main className="min-w-0 w-full xl:flex-1 h-[100dvh] overflow-x-hidden overflow-y-auto p-4 pt-24 sm:p-6 sm:pt-24 xl:p-10 relative z-10">
        
        {/* Glowing glass overlay decorations */}
        <div className="w-full min-w-0 max-w-[1600px] mx-auto pb-12 relative z-10">
          
          <Suspense fallback={<div className="flex min-h-[45vh] items-center justify-center"><div className="w-9 h-9 border-[3px] border-emerald-400 border-t-transparent rounded-full animate-spin" aria-label="Loading workspace" /></div>}>
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
          </Suspense>

        </div>
      </main>

    </div>
  );
};

export const App = () => {
  return (
    <div className="soft-ui-app">
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </div>
  );
};

export default App;
