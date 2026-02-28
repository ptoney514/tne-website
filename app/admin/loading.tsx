export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-stone-700 border-t-white rounded-full animate-spin" />
        <p className="text-stone-500 text-xs font-mono uppercase tracking-widest">
          Loading
        </p>
      </div>
    </div>
  );
}
