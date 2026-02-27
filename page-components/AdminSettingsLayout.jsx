'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import {
  Users,
  Shield,
  Building2,
  Calendar,
  MapPin,
  CreditCard,
  Mail,
  ClipboardCheck,
} from 'lucide-react';

// Sidebar navigation items
const SETTINGS_NAV = [
  { to: '/admin/settings/users', icon: Users, label: 'User Management' },
  { to: '/admin/settings/registration', icon: ClipboardCheck, label: 'Registration' },
  { to: '/admin/settings/roles', icon: Shield, label: 'Roles & Permissions', disabled: true },
  { to: '/admin/settings/organization', icon: Building2, label: 'Organization', disabled: true },
  { to: '/admin/seasons', icon: Calendar, label: 'Seasons' },
  { to: '/admin/settings/locations', icon: MapPin, label: 'Locations', disabled: true },
  { to: '/admin/settings/payments', icon: CreditCard, label: 'Payment Settings', disabled: true },
  { to: '/admin/settings/emails', icon: Mail, label: 'Email Templates', disabled: true },
];

function SettingsNavLink({ to, icon, label, disabled }) {
  const Icon = icon;
  const pathname = usePathname();
  const isActive = pathname === to;

  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-400 cursor-not-allowed">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto text-[10px] bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        isActive
          ? 'bg-tne-red text-white'
          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function AdminSettingsLayout({ children }) {
  return (
    <div className="min-h-screen bg-stone-100">
      <AdminNavbar />

      <div className="flex">
        {/* Settings Sidebar */}
        <aside className="w-60 min-h-[calc(100vh-3.5rem)] bg-white border-r border-stone-200 p-4 flex-shrink-0">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-3 mb-2">
              Settings
            </h2>
          </div>

          <nav className="space-y-1">
            {SETTINGS_NAV.map((item) => (
              <SettingsNavLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                disabled={item.disabled}
              />
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
