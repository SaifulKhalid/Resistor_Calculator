
import React, { useState } from 'react';
import { Home, Wrench, Info, Mail, Menu, X, ChevronRight } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    { label: 'Home', href: 'https://labddb.site', icon: <Home size={18} /> },
    { label: 'Tools', href: 'https://labddb.site/tools', icon: <Wrench size={18} /> },
    { label: 'About', href: 'https://labddb.site/index.html#about', icon: <Info size={18} /> },
    { label: 'Contact', href: 'https://labddb.site/index.html#contact', icon: <Mail size={18} /> },
  ];

  return (
    <nav className="w-full bg-[#050810]/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <a href="https://labddb.site" className="flex items-center gap-2 group">
              <img 
                src="https://labddb.site/logo.png" 
                alt="Lab DDB Logo" 
                className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
              />
              <span className="text-white font-black tracking-tighter text-xl uppercase italic">
                Lab <span className="text-indigo-500 not-italic">DDB</span>
              </span>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <ul className="flex items-center space-x-8">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all hover:translate-y-[-1px]"
                  >
                    <span className="text-indigo-500/50">
                      {item.icon}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-64 opacity-100 border-t border-slate-800' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="px-4 pt-2 pb-6 space-y-2 bg-[#0a0d14]">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="flex items-center gap-4 px-4 py-3 text-slate-300 hover:text-white hover:bg-indigo-600/10 rounded-xl transition-all font-bold uppercase tracking-widest text-xs"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-indigo-500">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
