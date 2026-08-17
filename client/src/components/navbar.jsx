import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MenuIcon, XIcon, SparklesIcon, LogOutIcon, ArrowRightIcon } from 'lucide-react';
import { useUser, useClerk, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const AUTH_LINKS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Candidates', href: '/candidates' },
  { name: 'Campaigns', href: '/campaigns' },
  { name: 'Templates', href: '/email-templates' },
  { name: 'Documents', href: '/documents' },
  { name: 'Email Logs', href: '/email-logs' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Settings', href: '/settings' },
];

const PUBLIC_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Platform', href: '#features' },
  { name: 'Workflow', href: '#workflow' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { isSignedIn, user } = useUser();
  const clerk = useClerk();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle hash scrolling smoothly
  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      if (location.pathname !== '/') {
        navigate(`/${href}`);
      } else {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (clerk && clerk.signOut) {
        await clerk.signOut();
      }
    } catch (err) {
      console.warn('Logout:', err);
    }
    window.location.href = '/';
  };

  const navLinks = isSignedIn ? AUTH_LINKS : PUBLIC_LINKS;

  return (
    <>
      <motion.nav
        className={`sticky top-0 z-50 flex w-full items-center justify-between px-4 py-3.5 md:px-12 lg:px-20 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl'
            : 'bg-black/30 backdrop-blur-md border-b border-white/5'
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 250, damping: 70, mass: 1 }}
      >
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/assets/logo.svg" alt="Thodar Logo" className="h-8.5 w-auto" width={170} height={40} />
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden lg:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isHash = link.href.startsWith('#');
            const isActive =
              !isHash &&
              (location.pathname === link.href ||
                (link.href !== '/' && link.href !== '/dashboard' && location.pathname.startsWith(link.href)));

            return isHash ? (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="transition-all duration-200 py-1.5 px-3 rounded-full text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                {link.name}
              </a>
            ) : (
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

        {/* Right Actions: Unauthenticated vs Authenticated */}
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link
                to="/campaigns/create"
                className="btn glass text-xs py-2 px-4 hover:bg-white/15 text-indigo-200 hover:text-white flex items-center gap-1.5 shadow-lg border-white/20"
              >
                <SparklesIcon className="size-3.5 text-amber-400" />
                Start Automation
              </Link>

              <div className="flex items-center gap-2.5 pl-2.5 border-l border-white/15">
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
                  className="btn glass text-xs py-2 px-3.5 text-gray-300 hover:text-white flex items-center gap-1.5 cursor-pointer hover:bg-rose-500/20 hover:border-rose-500/40"
                >
                  <LogOutIcon className="size-3.5 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/sign-in"
                className="btn glass text-xs py-2 px-5 text-gray-200 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="btn bg-white text-gray-950 text-xs py-2 px-5 font-semibold hover:bg-gray-200 transition shadow-lg flex items-center gap-1.5"
              >
                <span>Sign Up</span>
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl glass transition active:scale-90 lg:hidden cursor-pointer"
        >
          <MenuIcon className="size-6 text-gray-200" />
        </button>
      </motion.nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/95 text-lg font-medium backdrop-blur-2xl transition duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to="/" onClick={() => setIsOpen(false)} className="mb-2">
          <img src="/assets/logo.svg" alt="Thodar" className="h-9 w-auto" width={170} height={40} />
        </Link>

        <div className="flex flex-col items-center gap-3 w-full max-w-xs px-4 max-h-[55vh] overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            const isHash = link.href.startsWith('#');
            const isActive =
              !isHash &&
              (location.pathname === link.href ||
                (link.href !== '/' && link.href !== '/dashboard' && location.pathname.startsWith(link.href)));

            return isHash ? (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="w-full text-center py-2 px-4 rounded-xl text-sm transition text-gray-300 hover:text-white cursor-pointer"
              >
                {link.name}
              </a>
            ) : (
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

        {isSignedIn ? (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs px-4 mt-2">
            <Link
              to="/campaigns/create"
              className="btn glass text-sm py-2.5 px-6 text-indigo-300 hover:text-white flex items-center justify-center gap-2 w-full"
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
              className="btn glass text-sm py-2.5 px-6 text-rose-300 hover:text-white flex items-center justify-center gap-2 w-full cursor-pointer hover:bg-rose-500/20"
            >
              <LogOutIcon className="size-4 text-rose-400" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs px-4 mt-2">
            <Link
              to="/sign-in"
              className="btn glass text-sm py-2.5 px-6 text-gray-200 hover:text-white w-full text-center"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/sign-up"
              className="btn bg-white text-gray-950 text-sm py-2.5 px-6 font-semibold w-full text-center"
              onClick={() => setIsOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        )}

        <button
          onClick={() => setIsOpen(false)}
          className="rounded-full p-2.5 glass text-gray-400 hover:text-white mt-3 cursor-pointer"
        >
          <XIcon className="size-5" />
        </button>
      </div>
    </>
  );
}
