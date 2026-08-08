import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuIcon,
  XIcon,
  SparklesIcon,
  LogOutIcon,
  LayoutDashboardIcon,
  UsersIcon,
  SendIcon,
  FileTextIcon,
  FolderArchiveIcon,
  ListOrderedIcon,
  BarChart3Icon,
  ShieldCheckIcon,
  SettingsIcon,
} from 'lucide-react';
import { UserButton, useUser, useClerk } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { AmbientBackground } from '../components/AmbientBackground';

const NAV_LINKS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Candidates', href: '/candidates' },
  { name: 'Campaigns', href: '/campaigns' },
  { name: 'Templates', href: '/email-templates' },
  { name: 'Documents', href: '/documents' },
  { name: 'Email Logs', href: '/email-logs' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Settings', href: '/settings' },
];

export function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, isLoaded } = useUser();
  const clerk = useClerk();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      if (clerk && clerk.signOut) {
        await clerk.signOut();
      }
    } catch (err) {
      console.warn('Sign out notification:', err);
    }
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D10A8A] selection:text-white flex flex-col">
      {/* Dynamic Animated Ambient Background Glows */}
      <AmbientBackground />

      {/* Top Navbar */}
      <motion.nav
        className={`sticky top-0 z-50 flex w-full items-center justify-between px-4 py-3.5 md:px-12 lg:px-20 transition-all duration-300 ${
          isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl' : 'bg-black/30 backdrop-blur-md border-b border-white/5'
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 250, damping: 70, mass: 1 }}
      >
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/assets/logo.svg" alt="HireFlow" className="h-8.5 w-auto" width={160} height={38} />
        </Link>

        {/* Center: Main Navigation Links */}
        <div className="hidden xl:flex items-center space-x-6 text-sm font-medium">
          {NAV_LINKS.map((link) => {
            const isActive =
              location.pathname === link.href ||
              (link.href !== '/dashboard' && location.pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`transition-all duration-200 py-1.5 px-3 rounded-full text-xs font-medium ${
                  isActive
                    ? 'glass bg-white/20 text-white font-semibold shadow-sm shadow-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions, Start Automation & Profile/Logout */}
        <div className="hidden md:flex items-center gap-3.5">
          <Link
            to="/campaigns/create"
            className="btn glass text-xs py-2 px-5 hover:bg-white/15 text-indigo-200 hover:text-white flex items-center gap-1.5 shadow-lg border-white/20"
          >
            <SparklesIcon className="size-3.5 text-amber-400" />
            Start Automation
          </Link>

          {/* User Profile / Logout Button */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-white/15">
            {user ? (
              <div className="flex items-center gap-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'size-8.5 rounded-full border border-white/30',
                    },
                  }}
                />
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="btn glass text-xs py-2 px-4 text-gray-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOutIcon className="size-3.5 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="btn glass text-xs py-2 px-4 text-gray-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <LogOutIcon className="size-3.5 text-rose-400" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl glass transition active:scale-90 xl:hidden cursor-pointer"
        >
          <MenuIcon className="size-6 text-gray-200" />
        </button>
      </motion.nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/95 text-lg font-medium backdrop-blur-2xl transition duration-300 xl:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to="/" onClick={() => setIsOpen(false)} className="mb-2">
          <img src="/assets/logo.svg" alt="HireFlow" className="h-9 w-auto" width={160} height={38} />
        </Link>

        <div className="flex flex-col items-center gap-3 w-full max-w-xs px-4 max-h-[55vh] overflow-y-auto custom-scrollbar">
          {NAV_LINKS.map((link) => {
            const isActive =
              location.pathname === link.href ||
              (link.href !== '/dashboard' && location.pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`w-full text-center py-2 px-4 rounded-xl text-sm transition ${
                  isActive ? 'glass bg-white/20 text-white font-semibold' : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <Link
          to="/campaigns/create"
          className="btn glass text-sm py-2.5 px-6 text-indigo-300 hover:text-white flex items-center gap-2 mt-2"
          onClick={() => setIsOpen(false)}
        >
          <SparklesIcon className="size-4 text-amber-400" />
          Start Automation
        </Link>

        <button
          onClick={() => {
            setIsOpen(false);
            handleLogout();
          }}
          className="btn glass text-sm py-2.5 px-6 text-rose-300 hover:text-white flex items-center gap-2 cursor-pointer"
        >
          <LogOutIcon className="size-4 text-rose-400" />
          Sign Out
        </button>

        <button
          onClick={() => setIsOpen(false)}
          className="rounded-full p-2.5 glass text-gray-400 hover:text-white mt-2 cursor-pointer"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-12 py-8 space-y-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-6 px-4 md:px-12 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">HireFlow</span>
            <span>— Enterprise Recruitment Email &amp; Document Automation</span>
          </div>
          <div>© 2026 HireFlow Technologies Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
