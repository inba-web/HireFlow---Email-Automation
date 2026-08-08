import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MenuIcon, XIcon, SparklesIcon, SendIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const links = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Candidates', href: '/candidates' },
    { name: 'Campaigns', href: '/campaigns' },
    { name: 'Templates', href: '/email-templates' },
    { name: 'Analytics', href: '/analytics' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
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

  return (
    <>
      <motion.nav
        className={`sticky top-0 z-50 flex w-full items-center justify-between px-4 py-3.5 md:px-16 lg:px-24 transition-colors ${
          isScrolled ? 'bg-black/70 backdrop-blur-xl border-b border-white/10' : ''
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 250, damping: 70, mass: 1 }}
      >
        <Link to="/" className="flex items-center gap-2">
          <img src="/assets/logo.svg" alt="HireFlow Logo" className="h-8.5 w-auto" width={160} height={38} />
        </Link>

        <div className="hidden items-center space-x-8 md:flex text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-gray-300 hover:text-white transition duration-200"
            >
              {link.name}
            </Link>
          ))}
          
          <Link
            to="/campaigns/create"
            className="btn glass text-xs py-2 px-5 hover:bg-white/15 text-indigo-300 hover:text-white flex items-center gap-1.5"
          >
            <SparklesIcon className="size-3.5 text-amber-400" />
            Start Automation
          </Link>

          <Link
            to="/dashboard"
            className="btn bg-white text-gray-950 text-xs py-2 px-5 font-semibold hover:bg-gray-200 transition"
          >
            Launch App
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl glass transition active:scale-90 md:hidden cursor-pointer"
        >
          <MenuIcon className="size-6" />
        </button>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black/90 text-lg font-medium backdrop-blur-2xl transition duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to="/" onClick={() => setIsOpen(false)} className="mb-4">
          <img src="/assets/logo.svg" alt="HireFlow" className="h-9 w-auto" width={160} height={38} />
        </Link>

        {links.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            onClick={() => setIsOpen(false)}
            className="text-gray-200 hover:text-white transition"
          >
            {link.name}
          </Link>
        ))}

        <Link
          to="/campaigns/create"
          className="btn glass text-sm py-2.5 px-6 text-indigo-300 hover:text-white flex items-center gap-2"
          onClick={() => setIsOpen(false)}
        >
          <SparklesIcon className="size-4 text-amber-400" />
          Start Automation
        </Link>

        <Link
          to="/dashboard"
          className="btn bg-white text-gray-950 text-sm py-2.5 px-7 font-semibold"
          onClick={() => setIsOpen(false)}
        >
          Launch App
        </Link>

        <button
          onClick={() => setIsOpen(false)}
          className="rounded-full p-2.5 glass text-gray-400 hover:text-white mt-4 cursor-pointer"
        >
          <XIcon className="size-5" />
        </button>
      </div>
    </>
  );
}
