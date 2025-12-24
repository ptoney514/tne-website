// Main navigation links (no Tryouts or Login - those are seasonal/admin actions)
export const navLinks = [
  { path: '/teams', label: 'Teams' },
  { path: '/schedule', label: 'Schedule' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

// Shared navbar link styles (increased font size)
export const navLinkStyles = {
  base: 'text-[13px] font-semibold font-mono uppercase tracking-wider',
  active: 'text-white',
  inactive: 'text-white/70 hover:text-white transition-colors',
};
