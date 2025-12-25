import { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, TrendingUp, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';
import { useChatAnalytics } from '../hooks/useChatAnalytics';

function StatCard({ label, value, icon: Icon, subtext, loading }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider">
          {label}
        </h3>
        {Icon && <Icon className="w-5 h-5 text-stone-400" />}
      </div>
      <p className="text-3xl font-bebas text-stone-900 mt-2">
        {loading ? (
          <span className="animate-pulse bg-stone-200 rounded w-12 h-8 inline-block" />
        ) : (
          value
        )}
      </p>
      {subtext && (
        <p className="text-xs text-stone-500 mt-1">{subtext}</p>
      )}
    </div>
  );
}

function ConversationCard({ conversation }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const firstUserMessage = conversation.messages?.find(m => m.role === 'user')?.content || 'No messages';
  const hasFeedback = conversation.positive_feedback_count > 0 || conversation.negative_feedback_count > 0;

  return (
    <div className="rounded-xl bg-white border border-stone-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {conversation.positive_feedback_count > 0 && (
              <ThumbsUp className="w-4 h-4 text-green-500" />
            )}
            {conversation.negative_feedback_count > 0 && (
              <ThumbsDown className="w-4 h-4 text-red-500" />
            )}
            {!hasFeedback && (
              <MessageSquare className="w-4 h-4 text-stone-400" />
            )}
          </div>
          <p className="text-sm text-stone-900 truncate">{firstUserMessage}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-stone-400">{timeAgo(conversation.started_at)}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            {conversation.message_count || 0} msgs
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-stone-100">
          <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
            {conversation.messages?.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-tne-red text-white'
                      : 'bg-stone-100 text-stone-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] opacity-60">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.feedback && (
                      <span className={`text-[10px] ${msg.feedback === 'positive' ? 'text-green-300' : 'text-red-300'}`}>
                        {msg.feedback === 'positive' ? '(+)' : '(-)'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {conversation.page_url && (
            <p className="mt-3 text-xs text-stone-400">
              Started on: {conversation.page_url}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminChatAnalyticsPage() {
  const { stats, recentConversations, loading, error, refetch } = useChatAnalytics(30);

  return (
    <div className="bg-stone-100 text-stone-900 antialiased min-h-screen flex flex-col font-sans">
      <AdminNavbar />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bebas tracking-tight text-stone-900">Chat Analytics</h1>
              <p className="text-stone-500 mt-1">
                AI Assistant usage and feedback - Last 30 days
              </p>
            </div>
            <button
              onClick={refetch}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-400 hover:bg-stone-50 transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              Failed to load analytics: {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Chats"
              value={stats.totalChats}
              icon={MessageSquare}
              loading={loading}
            />
            <StatCard
              label="Satisfaction"
              value={`${stats.satisfactionRate}%`}
              icon={TrendingUp}
              subtext={`${stats.positiveCount} positive, ${stats.negativeCount} negative`}
              loading={loading}
            />
            <StatCard
              label="Avg Messages"
              value={stats.avgMessagesPerChat}
              icon={Clock}
              subtext="per conversation"
              loading={loading}
            />
            <StatCard
              label="Total Messages"
              value={stats.totalMessages}
              icon={MessageSquare}
              loading={loading}
            />
          </div>

          {/* Feedback Summary */}
          {(stats.positiveCount > 0 || stats.negativeCount > 0) && (
            <div className="mb-8 rounded-2xl bg-white border border-stone-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Feedback Summary</h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-stone-600">
                    <span className="font-semibold text-stone-900">{stats.positiveCount}</span> helpful
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-stone-600">
                    <span className="font-semibold text-stone-900">{stats.negativeCount}</span> not helpful
                  </span>
                </div>
                {stats.satisfactionRate >= 70 ? (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    Good performance
                  </span>
                ) : stats.satisfactionRate >= 50 ? (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                    Needs improvement
                  </span>
                ) : stats.satisfactionRate > 0 ? (
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                    Review knowledge base
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {/* Recent Conversations */}
          <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Recent Conversations</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentConversations.length > 0 ? (
              <div className="space-y-3">
                {recentConversations.map((conv) => (
                  <ConversationCard key={conv.id} conversation={conv} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">No conversations yet</p>
                <p className="text-stone-400 text-xs mt-1">Chat data will appear here once users start using the AI Assistant</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
