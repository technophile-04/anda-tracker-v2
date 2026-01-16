import Image from "next/image";

export function LoadingSpinner({
  className = "h-4 w-4",
  containerClassName = "",
}: {
  className?: string;
  containerClassName?: string;
}) {
  return (
    <div className={`flex items-center justify-center ${containerClassName}`}>
      <div
        className={`animate-spin rounded-full border-2 border-slate-900 border-t-transparent ${className}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export function FullPageLoading({ label }: { label?: string }) {
  return (
    <main className="min-h-screen text-slate-900 flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={64}
          height={64}
          className="rounded-xl shadow-sm bg-amber-50 animate-bounce"
        />
        <div className="flex flex-col items-center gap-2">
          <LoadingSpinner className="h-6 w-6" />
          {label && <p className="text-sm font-medium text-slate-600">{label}</p>}
        </div>
      </div>
    </main>
  );
}

const cardBaseClass =
  "rounded-3xl border-2 border-slate-900 p-6 shadow-[0_6px_0_0_rgba(15,23,42,0.25)]";

export function RoomLoadingSkeleton() {
  return (
    <main className="min-h-screen text-slate-900 relative">
      {/* Centered Loading Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-3xl border-2 border-slate-900 shadow-[0_6px_0_0_rgba(15,23,42,0.25)]">
           <Image
            src="/logo.svg"
            alt="Logo"
            width={48}
            height={48}
            className="rounded-xl"
          />
          <div className="flex items-center gap-3">
            <LoadingSpinner className="h-5 w-5" />
            <p className="font-semibold text-slate-900">Loading room...</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 flex flex-col gap-8 opacity-50 pointer-events-none select-none">
        {/* Header Skeleton */}
        <header
          className={`${cardBaseClass} bg-amber-100 flex flex-col gap-3`}
        >
          {/* Back link placeholder */}
          <div className="h-5 w-24 bg-amber-200/50 rounded animate-pulse" />
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Logo placeholder */}
              <div className="h-16 w-16 bg-amber-200/50 rounded-xl animate-pulse flex-shrink-0" />
              <div className="flex flex-col gap-2">
                <div className="h-3 w-16 bg-amber-200/50 rounded animate-pulse" />
                <div className="h-8 w-48 bg-amber-200/50 rounded animate-pulse" />
                <div className="h-4 w-32 bg-amber-200/50 rounded animate-pulse" />
              </div>
            </div>
            {/* Right side controls */}
            <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto">
              <div className="h-3 w-64 bg-amber-200/50 rounded animate-pulse hidden sm:block" />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                 <div className="h-8 w-56 bg-amber-200/50 rounded-full animate-pulse flex-grow sm:flex-grow-0" />
                 <div className="h-8 w-16 bg-amber-200/50 rounded-full animate-pulse" />
              </div>
              <div className="h-3 w-16 bg-amber-200/50 rounded animate-pulse self-end hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Main Content Skeleton */}
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Tray Area */}
          <div className={`${cardBaseClass} bg-white flex flex-col gap-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-slate-100 rounded-2xl animate-pulse flex-shrink-0" />
                <div>
                  <div className="h-3 w-16 bg-slate-100 rounded mb-2 animate-pulse" />
                  <div className="h-6 w-32 bg-slate-100 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
            {/* Eggs Grid */}
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-full bg-slate-100 animate-pulse border-2 border-slate-100"
                />
              ))}
            </div>
          </div>

          {/* Sidebar (Share split) */}
          <div className={`${cardBaseClass} bg-white flex flex-col gap-4`}>
            <div className="h-6 w-32 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
            <div className="flex flex-col gap-3 mt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-full rounded-2xl bg-slate-100 animate-pulse border-2 border-slate-100"
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="relative">
       {/* Centered Loading Overlay */}
       <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-3xl">
        <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-md">
          <LoadingSpinner className="h-5 w-5" />
          <p className="font-medium text-slate-900 text-sm">Loading your profile...</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 opacity-40 pointer-events-none">
        <div className={`${cardBaseClass} bg-white flex flex-col gap-3`}>
          <div>
            <div className="h-3 w-32 bg-slate-100 rounded mb-2 animate-pulse" />
            <div className="h-7 w-48 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-3 w-64 bg-slate-100 rounded animate-pulse" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className={`${cardBaseClass} bg-white`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-6 w-32 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-4 w-48 bg-slate-100 rounded mb-4 animate-pulse" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-full rounded-2xl bg-slate-100 animate-pulse border-2 border-slate-100"
                />
              ))}
            </div>
          </div>

          <div className={`${cardBaseClass} bg-white flex flex-col gap-6`}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-6 w-32 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-4 w-64 bg-slate-100 rounded mb-4 animate-pulse" />
              <div className="flex flex-col gap-3">
                <div className="h-10 w-full rounded-full bg-slate-100 animate-pulse" />
                <div className="h-10 w-32 rounded-full bg-slate-100 animate-pulse" />
              </div>
            </div>

            <div className="border-t-2 border-dashed border-slate-200 pt-6">
              <div className="h-6 w-32 bg-slate-100 rounded mb-2 animate-pulse" />
              <div className="h-4 w-64 bg-slate-100 rounded mb-4 animate-pulse" />
              <div className="flex flex-col gap-3">
                <div className="h-10 w-full rounded-full bg-slate-100 animate-pulse" />
                <div className="h-10 w-32 rounded-full bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
