export default function Loading() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="space-y-6 text-center">
        {/* Spinning logo */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold">
            Shop<span className="text-purple-500">Wave</span>
          </h2>
          <p className="text-muted-foreground text-base">Loading...</p>
        </div>
      </div>
    </main>
  );
}
