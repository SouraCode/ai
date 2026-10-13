import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Image as ImageIcon,
  Presentation,
  FileText,
  LogOut,
  Menu,
  Sparkles,
  User,
  X,
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Overview', icon: Home },
  { id: 'photos', label: 'Photo studio', icon: ImageIcon },
  { id: 'ppt', label: 'Presentations', icon: Presentation },
  { id: 'resume', label: 'Resume builder', icon: FileText },
  { id: 'profile', label: 'My profile', icon: User },
];

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initial = user?.username?.trim()?.charAt(0) || 'A';

  const navigate = (tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      <nav className="mobile-navigation xl:hidden fixed top-3 left-3 right-3 z-50" aria-label="Main navigation">
        <div className="mobile-menu-pill flex items-center justify-between px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="mobile-brand-mark"><Sparkles size={19} /></span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-wide text-[#3D4852]">ALL IN ONE</span>
              <span className="block text-[9px] font-semibold uppercase tracking-[.14em] text-[#6B7280]">Creative workspace</span>
            </span>
          </div>
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mobile-menu-panel mt-2 p-2">
            <p className="sidebar-section-label px-3 pt-2 pb-1">Workspace</p>
            {menuItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => navigate(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`sidebar-link ${activeTab === id ? 'is-active' : ''}`}
              >
                <span className="sidebar-link-icon"><Icon size={19} /></span>
                <span>{label}</span>
              </button>
            ))}
            <div className="sidebar-divider my-2" />
            <div className="mobile-account-row">
              <span className="sidebar-avatar">{initial.toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-[#3D4852]">{user?.username || 'Your account'}</span>
                <span className="block truncate text-[10px] text-[#6B7280]">{user?.email || 'Manage profile'}</span>
              </span>
              <button type="button" onClick={logout} className="sidebar-logout-icon" aria-label="Sign out"><LogOut size={17} /></button>
            </div>
          </div>
        )}
      </nav>

      <aside className="desktop-sidebar hidden xl:flex w-[18rem] h-[100dvh] shrink-0 p-4 relative z-30" aria-label="Workspace sidebar">
        <div className="sidebar-pill flex h-full w-full min-h-0 flex-col px-4 py-5">
          <div className="sidebar-brand flex items-center gap-3 px-2 pb-6">
            <div className="sidebar-brand-mark" aria-hidden="true"><Sparkles size={22} /></div>
            <div className="min-w-0">
              <div className="text-[15px] font-bold leading-tight tracking-[.04em] text-[#3D4852]">ALL IN ONE</div>
              <div className="mt-1 text-[9px] font-semibold uppercase tracking-[.18em] text-[#6B7280]">Creative workspace</div>
            </div>
          </div>

          <div className="sidebar-divider" />
          <p className="sidebar-section-label px-3 pt-5 pb-2">Workspace</p>
          <nav className="sidebar-links flex flex-col gap-1.5" aria-label="Workspace pages">
            {menuItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigate(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`sidebar-link ${isActive ? 'is-active' : ''}`}
                >
                  <span className="sidebar-link-icon"><Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} /></span>
                  <span>{label}</span>
                  {isActive && <span className="sidebar-link-dot" aria-hidden="true" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-5">
            <div className="sidebar-divider mb-4" />
            <div className="sidebar-account w-full">
              <span className="sidebar-avatar">{initial.toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-[#3D4852]">{user?.username || 'Your account'}</span>
                <span className="mt-1 block truncate text-[10px] text-[#6B7280]">{user?.email || 'Manage profile'}</span>
              </span>
              <button type="button" onClick={logout} className="sidebar-logout-icon" aria-label="Sign out"><LogOut size={17} /></button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
