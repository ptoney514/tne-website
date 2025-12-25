import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import tneLogoWhite from '../assets/tne-logo-white-transparent.png';
import { navLinks } from '../constants/navigation';

export default function MobileDrawer({ isOpen, onClose, showPayLink = false }) {
  const location = useLocation();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 h-full w-72 bg-[#0a0a0a] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <img
            src={tneLogoWhite}
            alt="TNE"
            className="h-12 w-12 object-contain"
          />
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={`block px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded-xl transition-colors ${
                isActive(link.path)
                  ? 'text-white bg-white/10'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {showPayLink && (
            <Link
              to="/payments"
              onClick={onClose}
              className={`block px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded-xl transition-colors ${
                isActive('/payments')
                  ? 'text-white bg-white/10'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              Payments
            </Link>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 space-y-3">
          <Link
            to="/tryouts"
            onClick={onClose}
            className="block w-full text-center px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded-xl bg-tne-red text-white hover:bg-tne-red-dark transition-colors shadow-lg shadow-tne-red/25"
          >
            Register
          </Link>
          <Link
            to="/login"
            onClick={onClose}
            className="block w-full text-center px-4 py-3 text-sm font-medium uppercase tracking-wider rounded-xl border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
