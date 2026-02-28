export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-tne-red rounded-full animate-spin" />
        <p className="text-white/40 text-xs font-mono uppercase tracking-widest">
          Loading
        </p>
      </div>
    </div>
  );
}
