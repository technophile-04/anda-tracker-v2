"use client";

const cardBaseClass =
  "rounded-3xl border-2 border-slate-900 p-6 shadow-[0_6px_0_0_rgba(15,23,42,0.25)]";

export default function ServerNote() {
  return (
    <div className={`${cardBaseClass} bg-white`}>
      <p className="text-sm text-slate-600">
        This route is a lightweight server-rendered placeholder.
      </p>
    </div>
  );
}
