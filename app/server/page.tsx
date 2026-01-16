import Link from "next/link";

const cardBaseClass =
  "rounded-3xl border-2 border-slate-900 p-6 shadow-[0_6px_0_0_rgba(15,23,42,0.25)]";

export default function ServerPage() {
  return (
    <main className="min-h-screen text-slate-900">
      <div className="max-w-3xl mx-auto p-8 flex flex-col gap-4">
        <Link href="/" className="text-sm text-slate-700">
          ← Back to rooms
        </Link>
        <section className={`${cardBaseClass} bg-white`}>
          <h1 className="text-3xl font-semibold">Egg Crate Tracker</h1>
          <p className="text-sm text-slate-600">
            The tray experience lives in the client routes for real-time
            updates.
          </p>
        </section>
      </div>
    </main>
  );
}
