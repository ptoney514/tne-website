import { CheckCircle, AlertTriangle, XCircle, FileSpreadsheet, Users, UserCheck, ClipboardList, Plus, RefreshCw } from 'lucide-react';

// eslint-disable-next-line no-unused-vars -- Icon is used as JSX component
function SummaryCard({ icon: Icon, label, value, color = 'stone' }) {
  const colorClasses = {
    stone: 'bg-stone-100 text-stone-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-stone-200">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-2xl font-bebas text-stone-900">{value}</p>
        <p className="text-[10px] text-stone-500 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function ChangesSummary({ diff }) {
  if (!diff) return null;

  const newCount =
    (diff.teams?.new?.length || 0) +
    (diff.coaches?.new?.length || 0) +
    (diff.rosters?.new?.length || 0);

  const updatedCount =
    (diff.teams?.updated?.length || 0) +
    (diff.coaches?.updated?.length || 0) +
    (diff.rosters?.updated?.length || 0);

  const unchangedCount =
    (diff.teams?.unchanged?.length || 0) +
    (diff.coaches?.unchanged?.length || 0) +
    (diff.rosters?.unchanged?.length || 0);

  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
        <Plus className="w-4 h-4 text-green-600" />
        <div>
          <p className="text-lg font-bebas text-green-700">{newCount}</p>
          <p className="text-[10px] text-green-600">New</p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
        <RefreshCw className="w-4 h-4 text-amber-600" />
        <div>
          <p className="text-lg font-bebas text-amber-700">{updatedCount}</p>
          <p className="text-[10px] text-amber-600">Updated</p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-50 border border-stone-200">
        <CheckCircle className="w-4 h-4 text-stone-400" />
        <div>
          <p className="text-lg font-bebas text-stone-600">{unchangedCount}</p>
          <p className="text-[10px] text-stone-500">Unchanged</p>
        </div>
      </div>
    </div>
  );
}

export default function ExcelValidationSummary({ parsedData, diff, errors = [], warnings = [] }) {
  if (!parsedData) {
    return null;
  }

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  // Count total players from rosters
  const totalPlayers = parsedData.rosters?.reduce(
    (sum, roster) => sum + (roster.players?.length || 0),
    0
  ) || 0;

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className={`rounded-xl p-4 flex items-start gap-3 ${
        hasErrors
          ? 'bg-red-50 border border-red-200'
          : hasWarnings
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-green-50 border border-green-200'
      }`}>
        {hasErrors ? (
          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        ) : hasWarnings ? (
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
        )}
        <div>
          <p className={`font-medium ${
            hasErrors ? 'text-red-700' : hasWarnings ? 'text-amber-700' : 'text-green-700'
          }`}>
            {hasErrors
              ? `${errors.length} error${errors.length > 1 ? 's' : ''} found`
              : hasWarnings
                ? `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`
                : 'File is valid and ready to upload'
            }
          </p>
          <p className={`text-sm mt-0.5 ${
            hasErrors ? 'text-red-600' : hasWarnings ? 'text-amber-600' : 'text-green-600'
          }`}>
            {hasErrors
              ? 'Please fix the errors before uploading'
              : hasWarnings
                ? 'You can proceed, but some data may be incomplete'
                : 'All data has been validated successfully'
            }
          </p>
        </div>
      </div>

      {/* Sheets Found */}
      {parsedData.sheets?.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Sheets found:</span>
          <div className="flex gap-1">
            {parsedData.sheets.map((sheet, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs">
                {sheet}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Data Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard
          icon={Users}
          label="Teams"
          value={parsedData.teams?.length || 0}
          color={parsedData.teams?.length > 0 ? 'green' : 'stone'}
        />
        <SummaryCard
          icon={UserCheck}
          label="Coaches"
          value={parsedData.coaches?.length || 0}
          color={parsedData.coaches?.length > 0 ? 'green' : 'stone'}
        />
        <SummaryCard
          icon={ClipboardList}
          label="Rosters"
          value={parsedData.rosters?.length || 0}
          color={parsedData.rosters?.length > 0 ? 'green' : 'stone'}
        />
        <SummaryCard
          icon={Users}
          label="Players"
          value={totalPlayers}
          color={totalPlayers > 0 ? 'green' : 'stone'}
        />
      </div>

      {/* Changes Summary (when comparing with existing data) */}
      {diff && <ChangesSummary diff={diff} />}

      {/* Errors List */}
      {hasErrors && (
        <div className="rounded-xl border border-red-200 overflow-hidden">
          <div className="px-4 py-2 bg-red-50 border-b border-red-200">
            <h4 className="text-sm font-medium text-red-700">Errors</h4>
          </div>
          <ul className="divide-y divide-red-100">
            {errors.map((error, idx) => (
              <li key={idx} className="px-4 py-2 text-sm text-red-600 bg-white">
                <span className="font-medium">{error.sheet}</span>
                {error.row && <span className="text-red-400"> (Row {error.row})</span>}
                : {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings List */}
      {hasWarnings && (
        <div className="rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
            <h4 className="text-sm font-medium text-amber-700">Warnings</h4>
          </div>
          <ul className="divide-y divide-amber-100">
            {warnings.map((warning, idx) => (
              <li key={idx} className="px-4 py-2 text-sm text-amber-600 bg-white">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
