/**
 * TeamDetailTabs - Tab navigation for team detail page
 *
 * Tabs: Roster, Practice Schedule, Tournaments, Coach & Settings
 */

const TABS = [
  { id: 'roster', label: 'Roster' },
  { id: 'practice', label: 'Practice Schedule' },
  { id: 'tournaments', label: 'Tournaments' },
  { id: 'settings', label: 'Coach & Settings' },
];

export default function TeamDetailTabs({ activeTab, onTabChange }) {
  return (
    <div className="bg-white border-b border-admin-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex gap-8 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors
                ${
                  activeTab === tab.id
                    ? 'text-admin-red'
                    : 'text-admin-text-secondary hover:text-admin-text'
                }
              `}
            >
              {tab.label}
              {/* Active indicator */}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-admin-red" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
