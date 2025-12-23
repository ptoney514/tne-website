// Shared navigation links used across MobileDrawer and PublicLayout
export const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/teams', label: 'Teams' },
  { path: '/schedule', label: 'Schedule' },
  { path: '/tryouts', label: 'Tryouts' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

// Shared navbar link styles
export const navLinkStyles = {
  base: 'text-[11px] font-medium font-mono uppercase tracking-wider',
  active: 'text-white',
  inactive: 'text-stone-300 hover:text-white transition-colors',
};
