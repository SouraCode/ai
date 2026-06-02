import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, Image as ImageIcon, Presentation, FileText, LogOut, ChevronLeft, ChevronRight, Leaf, Moon, Sun, User } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'photos', label: 'Photo Suite', icon: ImageIcon },
    { id: 'ppt', label: 'AI Presentation', icon: Presentation },
    { id: 'resume', label: 'Resume Builder', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User }
  ];

  const getActiveIndex = () => menuItems.findIndex(item => item.id === activeTab);

  // Gradient selection based on the active theme
  const getSidebarGradient = () => {
    if (theme === 'forest') {
      return 'bg-gradient-to-b from-[#0c1a16]/95 via-[#060e0c]/95 to-[#020504]/95 border-emerald-500/10 shadow-[0_8px_32px_0_rgba(16,185,129,0.06)]';
    } else {
      return 'bg-gradient-to-b from-[#0b1329]/95 via-[#060b19]/95 to-[#03050c]/95 border-cyan-500/10 shadow-[0_8px_32px_0_rgba(6,182,212,0.06)]';
    }
  };

  const getActiveIndicatorColor = () => {
    return theme === 'forest' 
      ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-400/10' 
      : 'bg-gradient-to-r from-cyan-500/20 to-cyan-400/10';
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. MOBILE LAYOUT: FLOATING GLASS BOTTOM BAR (Saves space, fully responsive!) */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 z-50 flex justify-center">
        {/* Floating bottom glass bar container */}
        <div className={`w-full max-w-md rounded-2xl border backdrop-blur-xl flex items-center justify-around py-2.5 px-4 ${getSidebarGradient()}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative ${
                  isActive 
                    ? 'text-emerald-400 scale-110' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
                <span className="text-[9px] mt-1 font-sans font-medium tracking-wide">{item.label.split(' ')[0]}</span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-glow" />
                )}
              </button>
            );
          })}
          
          {/* Theme Toggle in Mobile Nav */}
          <button 
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-400 hover:text-white"
          >
            {theme === 'forest' ? <Leaf size={20} className="text-emerald-400" /> : <Sun size={20} className="text-yellow-400 animate-spin-slow" />}
            <span className="text-[9px] mt-1 font-sans font-medium">Theme</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LAPTOP/DESKTOP LAYOUT: VERTICAL SLIDING GLASS SIDEBAR */}
      {/* ========================================================================= */}
      <aside 
        className={`hidden md:flex h-screen flex-col justify-between p-4 transition-all duration-300 relative z-30 select-none ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Semi-transparent Glass Gradient backdrop */}
        <div className={`absolute inset-0 m-4 rounded-[32px] border backdrop-blur-2xl transition-all duration-300 z-0 ${getSidebarGradient()}`}></div>

        {/* Sidebar Header Section */}
        <div className="relative z-10 p-2 flex flex-col items-center mt-2 w-full">
          <div className={`flex items-center w-full ${isExpanded ? 'justify-between gap-3' : 'justify-center'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Plant Leaf Branding */}
              <div 
                onClick={toggleTheme}
                title="Click to Switch Theme"
                className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner cursor-pointer transition-transform hover:scale-110 hover:rotate-12 duration-300 shrink-0"
              >
                {theme === 'forest' ? (
                  <Leaf className="text-emerald-400 fill-emerald-400 animate-float" size={20} />
                ) : (
                  <Sun className="text-yellow-400 fill-yellow-400 animate-spin-slow" size={20} />
                )}
              </div>
              
              {isExpanded && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-wide text-white leading-none">ALL IN ONE</span>
                  <span className="text-[9px] text-emerald-400/80 font-bold tracking-widest uppercase mt-0.5">
                    {theme === 'forest' ? 'Forest' : 'Midnight'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Collapse/Expand Toggle */}
            {isExpanded && (
              <button 
                onClick={() => setIsExpanded(false)}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-emerald-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
            )}
          </div>
          
          {!isExpanded && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-emerald-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer mt-4"
              title="Expand Sidebar"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Sidebar Menu Items Section */}
        <div className="relative z-10 flex-1 my-8 space-y-3 relative overflow-hidden flex flex-col justify-start">
          
          {/* Dynamic Sliding Active Highlight Notch */}
          {getActiveIndex() !== -1 && (
            <div 
              className={`sidebar-active-indicator ${getActiveIndicatorColor()}`}
              style={{
                transform: `translateY(${getActiveIndex() * 60 + 8}px)`,
                left: isExpanded ? '8px' : '6px',
                right: isExpanded ? '8px' : '6px',
              }}
            />
          )}

          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full h-12 rounded-2xl flex items-center transition-all duration-300 relative z-20 cursor-pointer ${
                  isExpanded ? 'gap-4 px-4 justify-start' : 'justify-center px-0'
                } ${
                  isActive 
                    ? 'text-white font-extrabold' 
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
                {isExpanded && <span className="text-sm font-sans tracking-wide">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer / User Profile & Theme Toggle */}
        <div className="relative z-10 p-2 border-t border-white/5 space-y-4">
          
          {/* Theme Mode Toggle Button */}
          {isExpanded && (
            <button 
              onClick={toggleTheme}
              className="w-full h-10 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {theme === 'forest' ? <Leaf size={14} /> : <Moon size={14} />}
                <span>Active Dark Mode</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold uppercase">
                {theme === 'forest' ? 'Forest' : 'Midnight'}
              </span>
            </button>
          )}

          {isExpanded ? (
            <div className="flex flex-col gap-3 w-full animate-fade-in">
              {/* Profile Card */}
              <div 
                onClick={() => setActiveTab('profile')}
                title="View Profile Details"
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/10 rounded-2xl cursor-pointer transition-all min-w-0 w-full"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-700/30 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <span className="font-bold text-emerald-300 uppercase">
                    {user?.username?.charAt(0) || 'G'}
                  </span>
                </div>
                <div className="flex flex-col truncate min-w-0 flex-1">
                  <span className="font-semibold text-xs text-white truncate leading-none mb-1">
                    {user?.username || 'Guest Innovator'}
                  </span>
                  <span className="text-[9px] text-emerald-300/60 truncate font-light">
                    {user?.email || 'guest@allinone.dev'}
                  </span>
                </div>
              </div>
              
              {/* Premium Log Out Button */}
              <button 
                onClick={logout}
                title="Log Out Session"
                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>Log Out Session</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center justify-center">
              <div 
                onClick={() => setActiveTab('profile')}
                title="View Profile Details"
                className="p-1 justify-center w-12 h-12 flex items-center cursor-pointer hover:bg-white/5 rounded-xl transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-700/30 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <span className="font-bold text-emerald-300 uppercase">
                    {user?.username?.charAt(0) || 'G'}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={logout}
                title="Log Out"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all cursor-pointer shrink-0"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
